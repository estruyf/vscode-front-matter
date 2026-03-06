import { PostMessageData } from './../../models/PostMessageData';
import { basename, join } from 'path';
import { commands, FileSystemWatcher, RelativePattern, TextDocument, Uri, workspace } from 'vscode';
import { Dashboard } from '../../commands/Dashboard';
import { Folders } from '../../commands/Folders';
import {
  COMMAND_NAME,
  ExtensionState,
  SETTING_DASHBOARD_CONTENT_CARD_DESCRIPTION,
  SETTING_DASHBOARD_CONTENT_CARD_TITLE
} from '../../constants';
import { DashboardCommand } from '../../dashboardWebView/DashboardCommand';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { Page } from '../../dashboardWebView/models';
import { ArticleHelper, Extension, Logger, parseWinPath, Settings, ContentType } from '../../helpers';
import { BaseListener } from './BaseListener';
import { DataListener } from '../panel';
import Fuse from 'fuse.js';
import { PagesParser } from '../../services/PagesParser';
import { unlinkAsync, rmdirAsync } from '../../utils';
import { LoadingType } from '../../models';
import { Questions } from '../../helpers/Questions';
import { Template } from '../../commands/Template';

export class PagesListener extends BaseListener {
  private static watchers: { [path: string]: FileSystemWatcher } = {};
  private static watchersPromises: { [path: string]: Promise<void> } = {};
  private static lastPages: Page[] = [];

  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static async process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case DashboardMessage.getData:
        this.getPagesData();
        break;
      case DashboardMessage.createContent:
        await commands.executeCommand(COMMAND_NAME.createContent);
        break;
      case DashboardMessage.createByContentType:
        await commands.executeCommand(COMMAND_NAME.createByContentType);
        break;
      case DashboardMessage.createByTemplate:
        await commands.executeCommand(COMMAND_NAME.createByTemplate);
        break;
      case DashboardMessage.createContentInFolder:
        await this.createContentInFolder(msg.payload);
        break;
      case DashboardMessage.refreshPages:
        this.getPagesData(true);
        break;
      case DashboardMessage.searchPages:
        this.searchPages(msg.payload);
        break;
      case DashboardMessage.deleteFile:
        this.deletePage(msg.payload);
        break;
      case DashboardMessage.rename:
        ArticleHelper.rename(msg.payload);
        break;
      case DashboardMessage.moveFile:
        await this.moveFile(msg.payload);
        break;
    }
  }

  /**
   * Saved file watcher
   * @returns
   */
  public static saveFileWatcher() {
    return workspace.onDidSaveTextDocument((doc: TextDocument) => {
      if (ArticleHelper.isSupportedFile(doc)) {
        Logger.info(`File saved ${doc.uri.fsPath}`);
        // Optimize the list of recently changed files
        DataListener.getFoldersAndFiles(doc.uri);
        // Trigger the metadata update
        this.watcherExec(doc.uri, 'save');
      }
    });
  }

  /**
   * Start watching the folders in the current workspace for content changes
   */
  public static async startWatchers() {
    const folders = await Folders.get();

    if (!folders || folders.length === 0) {
      return;
    }

    // Dispose all the current watchers
    const paths = Object.keys(this.watchers);
    for (const path of paths) {
      const watcher = this.watchers[path];
      watcher.dispose();
      delete this.watchers[path];
    }

    // Recreate all the watchers
    for (const folder of folders) {
      const folderUri = Uri.parse(folder.path);
      const watcher = workspace.createFileSystemWatcher(
        new RelativePattern(folderUri, '**/*'),
        false,
        false,
        false
      );
      watcher.onDidCreate(async (uri: Uri) => this.watcherExec(uri, 'create'));
      watcher.onDidChange(async (uri: Uri) => this.watcherExec(uri, 'change'));
      watcher.onDidDelete(async (uri: Uri) => this.watcherExec(uri, 'delete'));
      this.watchers[folderUri.fsPath] = watcher;
    }
  }

  /**
   * Delete a page
   * @param path
   */
  private static async deletePage(path: string) {
    if (!path) {
      return;
    }

    // Get the content type of the page
    const article = await ArticleHelper.getFrontMatterByPath(path);
    if (!article) {
      return;
    }
    const contentType = await ArticleHelper.getContentType(article);

    Logger.info(`Deleting file: ${path}`);

    await unlinkAsync(path);

    // Check if the content type is a page bundle
    if (contentType.pageBundle) {
      const absPath = parseWinPath(path);
      const folder = absPath.substring(0, absPath.lastIndexOf('/') + 1);
      try {
        // Check if the folder is empty
        const files = await workspace.fs.readDirectory(Uri.file(folder));
        if (files.length > 0) {
          // Remove each file
          for (const file of files) {
            await unlinkAsync(`${folder}${file[0]}`);
          }
        }

        // Delete the folder
        await rmdirAsync(folder);
      } catch (e) {
        console.log((e as any).message);
      }
    }

    this.lastPages = this.lastPages.filter((p) => p.fmFilePath !== path);
    this.sendPageData(this.lastPages);

    const ext = Extension.getInstance();
    await ext.setState(ExtensionState.Dashboard.Pages.Cache, this.lastPages, 'workspace');
  }

  /**
   * Watcher for processing page updates
   * @param file
   */
  private static async watcherExec(file: Uri, type?: 'create' | 'change' | 'delete' | 'save') {
    const progressFile = async (file: Uri) => {
      const ext = Extension.getInstance();
      Logger.info(`File watcher execution for (${type}): ${file.fsPath}`);

      const pageIdx = this.lastPages.findIndex((p) => p.fmFilePath === file.fsPath);
      if (pageIdx !== -1) {
        const stats = await workspace.fs.stat(file);
        const crntPage = this.lastPages[pageIdx];
        const updatedPage = await PagesParser.processPageContent(
          file.fsPath,
          stats.mtime,
          basename(file.fsPath),
          crntPage.fmFolder
        );
        if (updatedPage) {
          this.lastPages[pageIdx] = updatedPage;
          if (Dashboard.isOpen) {
            this.sendPageData(this.lastPages);
          }
          await ext.setState(ExtensionState.Dashboard.Pages.Cache, this.lastPages, 'workspace');
        }
      } else {
        this.getPagesData(true);
      }
    };

    const watcherPromise = this.watchersPromises[file.fsPath];
    if (!watcherPromise) {
      this.watchersPromises[file.fsPath] = progressFile(file);
    }
    await this.watchersPromises[file.fsPath];
    delete this.watchersPromises[file.fsPath];
  }

  /**
   * Retrieve all the markdown pages
   */
  public static async getPagesData(clear = false, cb?: (pages: Page[]) => void) {
    const ext = Extension.getInstance();

    // Get data from the cache
    if (!clear) {
      const cachedPages = await ext.getState<Page[]>(
        ExtensionState.Dashboard.Pages.Cache,
        'workspace'
      );
      if (cachedPages) {
        this.sendPageData(cachedPages);

        if (cb) {
          cb(cachedPages);
        }
      } else {
        this.sendMsg(DashboardCommand.loading, 'initPages' as LoadingType);
      }
    } else {
      PagesParser.reset();
    }

    PagesParser.getPages(async (pages: Page[]) => {
      this.lastPages = pages;
      this.sendPageData(pages);

      this.sendMsg(DashboardCommand.searchReady, true);

      await this.createSearchIndex(pages);
      this.sendMsg(DashboardCommand.loading, undefined as LoadingType);

      if (cb) {
        cb(pages);
      }
    });
  }

  /**
   * Send the page data without the body
   */
  private static sendPageData(pages: Page[]) {
    // Omit the body content
    this.sendMsg(
      DashboardCommand.pages,
      pages.map((p) => {
        const { fmBody, ...rest } = p;
        return rest;
      })
    );
  }

  /**
   * Create the search index for the pages
   * @param pages
   */
  private static async createSearchIndex(pages: Page[]) {
    const pagesIndex = Fuse.createIndex(
      ['title', 'slug', 'description', 'fmBody', 'type', 'fmContentType', 'fmLocale.locale'],
      pages
    );
    await Extension.getInstance().setState(
      ExtensionState.Dashboard.Pages.Index,
      pagesIndex.toJSON(),
      'workspace'
    );
  }

  /**
   * Search the pages
   */
  private static async searchPages(data: { query: string }) {
    const fieldKeys = [
      { name: 'title', weight: 1 },
      { name: 'fmBody', weight: 1 },
      { name: 'slug', weight: 0.5 },
      { name: 'description', weight: 0.5 }
    ];

    const cardTitle = Settings.get(SETTING_DASHBOARD_CONTENT_CARD_TITLE);
    if (cardTitle) {
      fieldKeys.push({ name: cardTitle as string, weight: 1 });
    }
    const cardDescription = Settings.get(SETTING_DASHBOARD_CONTENT_CARD_DESCRIPTION);
    if (cardTitle) {
      fieldKeys.push({ name: cardDescription as string, weight: 0.5 });
    }

    const fuseOptions: Fuse.IFuseOptions<Page> = {
      keys: fieldKeys,
      includeScore: true,
      ignoreLocation: true,
      threshold: 0.1
    };

    const pagesIndex = await Extension.getInstance().getState<Fuse.FuseIndex<Page>>(
      ExtensionState.Dashboard.Pages.Index,
      'workspace'
    );
    const fuseIndex = Fuse.parseIndex(pagesIndex);
    const fuse = new Fuse(this.lastPages, fuseOptions, fuseIndex);
    const results = fuse.search(data.query || '');
    const pageResults = results.map((page) => page.item);

    this.sendMsg(DashboardCommand.searchPages, pageResults);
  }

  /**
   * Move a file to a different folder
   * @param payload
   */
  private static async moveFile(payload: { filePath: string; destinationFolder: string }) {
    if (!payload || !payload.filePath || !payload.destinationFolder) {
      return;
    }

    const { filePath, destinationFolder } = payload;

    try {
      const wsFolder = Folders.getWorkspaceFolder();
      if (!wsFolder) {
        Logger.error('Workspace folder not found');
        return;
      }

      // Get all content folders
      const folders = await Folders.get();
      if (!folders || folders.length === 0) {
        Logger.error('No content folders found');
        return;
      }

      // Find the destination folder
      let targetFolderPath = '';
      for (const folder of folders) {
        const absoluteFolderPath = Folders.getFolderPath(Uri.file(folder.path));
        const relativeFolderPath = parseWinPath(absoluteFolderPath)
          .replace(parseWinPath(wsFolder.fsPath), '')
          .replace(/^\/+|\/+$/g, '');

        if (
          destinationFolder === relativeFolderPath ||
          destinationFolder.startsWith(relativeFolderPath + '/')
        ) {
          targetFolderPath = absoluteFolderPath;
          // Add subfolder if any
          if (destinationFolder !== relativeFolderPath) {
            const subPath = destinationFolder
              .substring(relativeFolderPath.length)
              .replace(/^\/+|\/+$/g, '');
            targetFolderPath = join(targetFolderPath, subPath);
          }
          break;
        }
      }

      if (!targetFolderPath) {
        Logger.error('Target folder not found');
        return;
      }

      // Get the file name
      const fileName = basename(filePath);
      const newFilePath = join(targetFolderPath, fileName);

      // Check if target already exists
      try {
        await workspace.fs.stat(Uri.file(newFilePath));
        Logger.error(`File already exists at destination: ${newFilePath}`);
        return;
      } catch {
        // File doesn't exist, which is good
      }

      // Check if it's a page bundle
      const article = await ArticleHelper.getFrontMatterByPath(filePath);
      if (article) {
        const contentType = await ArticleHelper.getContentType(article);
        
        if (contentType.pageBundle) {
          // Move the entire folder
          const sourceFolder = parseWinPath(filePath).substring(
            0,
            parseWinPath(filePath).lastIndexOf('/')
          );
          const folderName = basename(sourceFolder);
          const newFolderPath = join(targetFolderPath, folderName);

          // Move the folder
          await workspace.fs.rename(Uri.file(sourceFolder), Uri.file(newFolderPath), {
            overwrite: false
          });

          Logger.info(`Moved page bundle from ${sourceFolder} to ${newFolderPath}`);
        } else {
          // Move just the file
          await workspace.fs.rename(Uri.file(filePath), Uri.file(newFilePath), {
            overwrite: false
          });

          Logger.info(`Moved file from ${filePath} to ${newFilePath}`);
        }
      } else {
        // Move just the file
        await workspace.fs.rename(Uri.file(filePath), Uri.file(newFilePath), {
          overwrite: false
        });

        Logger.info(`Moved file from ${filePath} to ${newFilePath}`);
      }

      // Refresh the pages data
      this.getPagesData(true);
    } catch (error) {
      Logger.error(`Error moving file: ${(error as Error).message}`);
    }
  }

  /**
   * Create content in a specific folder
   * @param payload
   */
  private static async createContentInFolder(payload: { folderPath: string | null }) {
    if (!payload) {
      // Fall back to regular content creation
      await commands.executeCommand(COMMAND_NAME.createContent);
      return;
    }

    const { folderPath } = payload;
    
    // Get all content folders
    let folders = await Folders.get();
    folders = folders.filter((f) => !f.disableCreation);

    if (!folders || folders.length === 0) {
      await commands.executeCommand(COMMAND_NAME.createContent);
      return;
    }

    let targetFolder = null;
    let subPath = '';

    if (folderPath) {
      // The folderPath is a relative path like "content/posts" or "blog/en"
      // We need to find the matching content folder and determine the subfolder
      for (const folder of folders) {
        const wsFolder = Folders.getWorkspaceFolder();
        if (!wsFolder) {
          continue;
        }

        const absoluteFolderPath = Folders.getFolderPath(Uri.file(folder.path));
        const relativeFolderPath = parseWinPath(absoluteFolderPath).replace(parseWinPath(wsFolder.fsPath), '').replace(/^\/+|\/+$/g, '');
        
        // Check if the folderPath starts with this content folder
        if (folderPath === relativeFolderPath || folderPath.startsWith(relativeFolderPath + '/')) {
          targetFolder = folder;
          // Extract the subfolder part
          if (folderPath !== relativeFolderPath) {
            subPath = folderPath.substring(relativeFolderPath.length).replace(/^\/+|\/+$/g, '');
          }
          break;
        }
      }
    }

    if (!targetFolder) {
      // If no folder matches, let the user select one
      const selectedFolder = await Questions.SelectContentFolder();
      if (!selectedFolder) {
        return;
      }
      targetFolder = folders.find((f) => f.path === selectedFolder.path);
    }

    if (!targetFolder) {
      return;
    }

    // Get the folder path
    let absoluteFolderPath = Folders.getFolderPath(Uri.file(targetFolder.path));
    
    // Add the subfolder if any
    if (subPath) {
      absoluteFolderPath = join(absoluteFolderPath, subPath);
    }

    // Check if templates are enabled
    const templatesEnabled = Settings.get('dashboardState.contents.templatesEnabled');
    
    if (templatesEnabled) {
      // Use the template creation flow
      await Template.create(absoluteFolderPath);
    } else {
      // Use the content type creation flow
      const selectedContentType = await Questions.SelectContentType(targetFolder.contentTypes || []);
      if (!selectedContentType) {
        return;
      }

      const contentTypes = ContentType.getAll();
      const contentType = contentTypes?.find((ct) => ct.name === selectedContentType);
      if (contentType) {
        ContentType['create'](contentType, absoluteFolderPath);
      }
    }
  }

  /**
   * Get fresh page data
   */
  public static refresh() {
    this.getPagesData(true);
  }
}
