import { DEFAULT_CONTENT_TYPE_NAME } from './../../constants/ContentType';
import { isValidFile } from '../../helpers/isValidFile';
import { existsSync, unlinkSync } from "fs";
import { basename, dirname, join } from "path";
import { commands, FileSystemWatcher, RelativePattern, TextDocument, Uri, workspace } from "vscode";
import { Dashboard } from "../../commands/Dashboard";
import { Folders } from "../../commands/Folders";
import { COMMAND_NAME, DefaultFields, ExtensionState, SETTING_SEO_DESCRIPTION_FIELD } from "../../constants";
import { DashboardCommand } from "../../dashboardWebView/DashboardCommand";
import { DashboardMessage } from "../../dashboardWebView/DashboardMessage";
import { Page } from "../../dashboardWebView/models";
import { ArticleHelper, Extension, Logger, Settings } from "../../helpers";
import { ContentType } from "../../helpers/ContentType";
import { DateHelper } from "../../helpers/DateHelper";
import { Notifications } from "../../helpers/Notifications";
import { BaseListener } from "./BaseListener";
import { DataListener } from '../panel';
import Fuse from 'fuse.js';


export class PagesListener extends BaseListener {
  private static watchers: { [path: string]: FileSystemWatcher } = {};
  private static lastPages: Page[] = [];

  /**
   * Process the messages for the dashboard views
   * @param msg 
   */
  public static async process(msg: { command: DashboardMessage, data: any }) {
    super.process(msg);

    switch(msg.command) {
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
        this.searchPages(msg.data);
        break;
      case DashboardMessage.deleteFile:
        this.deletePage(msg.data);
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
        DataListener.getFoldersAndFiles();
        // Trigger the metadata update
        this.watcherExec(doc.uri);
      }
    })
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
      let watcher = workspace.createFileSystemWatcher(new RelativePattern(folderUri, "**/*"), false, false, false);
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

    Logger.info(`Deleting file: ${path}`)
    
    unlinkSync(path);
      
    this.lastPages = this.lastPages.filter(p => p.fmFilePath !== path);
    this.sendPageData(this.lastPages);

    const ext = Extension.getInstance();
    await ext.setState(ExtensionState.Dashboard.Pages.Cache, this.lastPages, "workspace");
  }

  /**
   * Watcher for processing page updates
   * @param file 
   */
  private static async watcherExec(file: Uri) {
    if (Dashboard.isOpen) {
      const ext = Extension.getInstance();
      Logger.info(`File watcher execution for: ${file.fsPath}`)
      
      const pageIdx = this.lastPages.findIndex(p => p.fmFilePath === file.fsPath);
      if (pageIdx !== -1) {
        const stats = await workspace.fs.stat(file);
        const crntPage = this.lastPages[pageIdx];
        const updatedPage = this.processPageContent(file.fsPath, stats.mtime, basename(file.fsPath), crntPage.fmFolder);
        if (updatedPage) {
          this.lastPages[pageIdx] = updatedPage;
          this.sendPageData(this.lastPages);
          await ext.setState(ExtensionState.Dashboard.Pages.Cache, this.lastPages, "workspace");
        }
      } else {
        this.getPagesData(true);
      }
    }
  }

  /**
   * Retrieve all the markdown pages
   */
  private static async getPagesData(clear: boolean = false) {
    const ext = Extension.getInstance();

    // Get data from the cache
    if (!clear) {
      const cachedPages = await ext.getState<Page[]>(ExtensionState.Dashboard.Pages.Cache, "workspace");
      if (cachedPages) {
        this.sendPageData(cachedPages);
      }
    }

    // Update the dashboard with the fresh data
    const folderInfo = await Folders.getInfo();
    const pages: Page[] = [];

    if (folderInfo) {
      for (const folder of folderInfo) {
        for (const file of folder.lastModified) {
          if (isValidFile(file.fileName)) {
            try {
              const page = this.processPageContent(file.filePath, file.mtime, file.fileName, folder.title);

              if (page && !pages.find(p => p.fmFilePath === page.fmFilePath)) {
                pages.push(page);
              }
              
            } catch (error: any) {
              if ((error as Error)?.message.toLowerCase() === "webview is disposed") {
                continue;
              }

              Logger.error(`PagesListener::getPagesData: ${file.filePath} - ${error.message}`);
              Notifications.error(`File error: ${file.filePath} - ${error?.message || error}`);
            }
          }
        }
      }
    }

    this.lastPages = pages;
    this.sendPageData(pages);

    this.sendMsg(DashboardCommand.searchReady, true);

    await ext.setState(ExtensionState.Dashboard.Pages.Cache, pages, "workspace");
    await this.createSearchIndex(pages);
  }

  /**
   * Send the page data without the body
   */
  private static sendPageData(pages: Page[]) {
    // Omit the body content
    this.sendMsg(DashboardCommand.pages, pages.map(p => {
      const { fmBody, ...rest } = p;
      return rest;
    }));
  }

  /**
   * Create the search index for the pages
   * @param pages 
   */
  private static async createSearchIndex(pages: Page[]) {
    const pagesIndex = Fuse.createIndex([ 'title', 'slug', 'description', 'fmBody' ], pages);
    await Extension.getInstance().setState(ExtensionState.Dashboard.Pages.Index, pagesIndex, "workspace");
  }

  /**
   * Search the pages
   */
  private static async searchPages(data: { query: string }) {
    const fuseOptions: Fuse.IFuseOptions<Page> = {
      keys: [
        { name: 'title', weight: 1 },
        { name: 'fmBody', weight: 1,  },
        { name: 'slug', weight: 0.5 },
        { name: 'description', weight: 0.5 },
      ],
      includeScore: true,
      ignoreLocation: true,
      threshold: 0.1
    };

    const pagesIndex = await Extension.getInstance().getState<Fuse.FuseIndex<Page>>(ExtensionState.Dashboard.Pages.Index, "workspace");
    const fuse = new Fuse(this.lastPages, fuseOptions, pagesIndex);
    const results = fuse.search(data.query || "");
    const pageResults = results.map(page => page.item);

    this.sendMsg(DashboardCommand.searchPages, pageResults);
  }

  /**
   * Get fresh page data
   */
  public static refresh() {
    this.getPagesData(true);
  }

  /**
   * Process the page content
   * @param filePath 
   * @param fileMtime 
   * @param fileName 
   * @param folderTitle 
   * @returns 
   */
  private static processPageContent(filePath: string, fileMtime: number, fileName: string, folderTitle: string): Page | undefined {
    const article = ArticleHelper.getFrontMatterByPath(filePath);

    if (article?.data.title) {
      const wsFolder = Folders.getWorkspaceFolder();
      const descriptionField = Settings.get(SETTING_SEO_DESCRIPTION_FIELD) as string || DefaultFields.Description;

      const dateField = ArticleHelper.getPublishDateField(article) || DefaultFields.PublishingDate;
      const dateFieldValue = article?.data[dateField] ? DateHelper.tryParse(article?.data[dateField]) : undefined;

      const modifiedField = ArticleHelper.getModifiedDateField(article) || null;
      const modifiedFieldValue = modifiedField && article?.data[modifiedField] ? DateHelper.tryParse(article?.data[modifiedField])?.getTime() : undefined;

      const staticFolder = Folders.getStaticFolderRelativePath();

      const page: Page = {
        ...article.data,
        // FrontMatter properties
        fmFolder: folderTitle,
        fmFilePath: filePath,
        fmFileName: fileName,
        fmDraft: ContentType.getDraftStatus(article?.data),
        fmModified: modifiedFieldValue ? modifiedFieldValue : fileMtime,
        fmPublished: dateFieldValue ? dateFieldValue.getTime() : null,
        fmYear: dateFieldValue ? dateFieldValue.getFullYear() : null,
        fmPreviewImage: "",
        fmTags: [],
        fmCategories: [],
        fmContentType: DEFAULT_CONTENT_TYPE_NAME,
        fmBody: article?.content || "",
        // Make sure these are always set
        title: article?.data.title,
        slug: article?.data.slug,
        date: article?.data[dateField] || "",
        draft: article?.data.draft,
        description: article?.data[descriptionField] || "",
      };

      const contentType = ArticleHelper.getContentType(article.data);
      if (contentType) {
        page.fmContentType = contentType.name;
      }

      let previewFieldParents = ContentType.findPreviewField(contentType.fields);
      if (previewFieldParents.length === 0) {
        const previewField = contentType.fields.find(field => field.type === "image" && field.name === "preview");
        if (previewField) {
          previewFieldParents = ["preview"];
        }
      }

      let tagParents = ContentType.findFieldByType(contentType.fields, "tags");
      page.fmTags = ContentType.getFieldValue(article.data, tagParents.length !== 0 ? tagParents : ["tags"]);

      let categoryParents = ContentType.findFieldByType(contentType.fields, "categories");
      page.fmCategories = ContentType.getFieldValue(article.data, categoryParents.length !== 0 ? categoryParents : ["categories"]);

      // Check if parent fields were retrieved, if not there was no image present
      if (previewFieldParents.length > 0) {
        let fieldValue = null;
        let crntPageData = article?.data;

        for (let i = 0; i < previewFieldParents.length; i++) {
          const previewField = previewFieldParents[i];

          if (i === previewFieldParents.length - 1) {
            fieldValue = crntPageData[previewField];
          } else {
            if (!crntPageData[previewField]) {
              continue;
            }

            crntPageData = crntPageData[previewField];

            // Check for preview image in block data
            if (crntPageData instanceof Array && crntPageData.length > 0) {
              // Get the first field block that contains the next field data
              const fieldData = crntPageData.find(item => item[previewFieldParents[i + 1]]);
              if (fieldData) {
                crntPageData = fieldData;
              } else {
                continue;
              }
            }
          }
        }

        if (fieldValue && wsFolder) {
          if (fieldValue && Array.isArray(fieldValue)) {
            if (fieldValue.length > 0) {
              fieldValue = fieldValue[0];
            } else {
              fieldValue = undefined;
            }
          }
  
          // Revalidate as the array could have been empty
          if (fieldValue) {
            const staticPath = join(wsFolder.fsPath, staticFolder || "", fieldValue);
            const contentFolderPath = join(dirname(filePath), fieldValue);
  
            let previewUri = null;
            if (existsSync(staticPath)) {
              previewUri = Uri.file(staticPath);
            } else if (existsSync(contentFolderPath)) {
              previewUri = Uri.file(contentFolderPath);
            }
  
            if (previewUri) {
              const preview = Dashboard.getWebview()?.asWebviewUri(previewUri);
              page["fmPreviewImage"] = preview?.toString() || "";
            }
          }
        }
      }

      return page;
    }

    return;
  }
}