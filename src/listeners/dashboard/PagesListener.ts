import { PostMessageData } from './../../models/PostMessageData';
import { basename } from 'path';
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
import { ArticleHelper, Extension, Logger, parseWinPath, Settings } from '../../helpers';
import { BaseListener } from './BaseListener';
import { DataListener } from '../panel';
import Fuse from 'fuse.js';
import { PagesParser } from '../../services/PagesParser';
import { unlinkAsync, rmdirAsync } from '../../utils';
import { LoadingType } from '../../models';

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
        this.watcherExec(doc.uri);
      }
    });
  }

  /**
   * Start watching the folders in the current workspace for content changes
   */
  public static async startWatchers() {
    const folders = Folders.get();

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
      let watcher = workspace.createFileSystemWatcher(
        new RelativePattern(folderUri, '**/*'),
        false,
        false,
        false
      );
      watcher.onDidCreate(async (uri: Uri) => this.watcherExec(uri));
      watcher.onDidChange(async (uri: Uri) => this.watcherExec(uri));
      watcher.onDidDelete(async (uri: Uri) => this.watcherExec(uri));
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
    const contentType = ArticleHelper.getContentType(article);

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
  private static async watcherExec(file: Uri) {
    const progressFile = async (file: Uri) => {
      const ext = Extension.getInstance();
      Logger.info(`File watcher execution for: ${file.fsPath}`);

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
  public static async getPagesData(clear: boolean = false, cb?: (pages: Page[]) => void) {
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
      ['title', 'slug', 'description', 'fmBody', 'type', 'fmContentType'],
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
   * Get fresh page data
   */
  public static refresh() {
    this.getPagesData(true);
  }
}
