import { isValidFile } from '../../helpers/isValidFile';
import { existsSync } from "fs";
import { basename, dirname, join } from "path";
import { commands, FileSystemWatcher, RelativePattern, Uri, workspace } from "vscode";
import { Dashboard } from "../../commands/Dashboard";
import { Folders } from "../../commands/Folders";
import { COMMAND_NAME, DefaultFields, SETTINGS_CONTENT_STATIC_FOLDER, SETTING_DATE_FIELD, SETTING_SEO_DESCRIPTION_FIELD } from "../../constants";
import { DashboardCommand } from "../../dashboardWebView/DashboardCommand";
import { DashboardMessage } from "../../dashboardWebView/DashboardMessage";
import { Page } from "../../dashboardWebView/models";
import { ArticleHelper, Logger, Settings } from "../../helpers";
import { ContentType } from "../../helpers/ContentType";
import { DateHelper } from "../../helpers/DateHelper";
import { Notifications } from "../../helpers/Notifications";
import { BaseListener } from "./BaseListener";
import { Field } from '../../models';


export class PagesListener extends BaseListener {
  private static watchers: { [path: string]: FileSystemWatcher } = {};
  private static lastPages: Page[] = [];

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
      let watcher = workspace.createFileSystemWatcher(new RelativePattern(folderUri, "*"), false, false, false);
      watcher.onDidCreate(async (uri: Uri) => this.watcherExec(uri));
      watcher.onDidChange(async (uri: Uri) => this.watcherExec(uri));
      watcher.onDidDelete(async (uri: Uri) => this.watcherExec(uri));
      this.watchers[folderUri.fsPath] = watcher;
    }
  }

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
    }
  }

  private static async watcherExec(file: Uri) {
    if (Dashboard.isOpen) {
      Logger.info(`File watcher execution for: ${file.fsPath}`)
      
      const pageIdx = this.lastPages.findIndex(p => p.fmFilePath === file.fsPath);
      if (pageIdx !== -1) {
        const stats = await workspace.fs.stat(file);
        const crntPage = this.lastPages[pageIdx];
        const updatedPage = this.processPageContent(file.fsPath, stats.mtime, basename(file.fsPath), crntPage.fmFolder);
        if (updatedPage) {
          this.lastPages[pageIdx] = updatedPage;
          this.sendMsg(DashboardCommand.pages, this.lastPages);
        }
      } else {
        this.getPagesData();
      }
    }
  }

  /**
   * Retrieve all the markdown pages
   */
  private static async getPagesData() {
    const folderInfo = await Folders.getInfo();
    const pages: Page[] = [];

    if (folderInfo) {
      for (const folder of folderInfo) {
        for (const file of folder.lastModified) {
          if (isValidFile(file.fileName)) {
            try {
              const page = this.processPageContent(file.filePath, file.mtime, file.fileName, folder.title);

              if (page) {
                pages.push(page);
              }
              
            } catch (error: any) {
              Notifications.error(`File error: ${file.filePath} - ${error?.message || error}`);
            }
          }
        }
      }
    }

    this.lastPages = pages;
    this.sendMsg(DashboardCommand.pages, pages);
  }

  public static refresh() {
    this.getPagesData();
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
      const dateField = Settings.get(SETTING_DATE_FIELD) as string || DefaultFields.PublishingDate;
      const staticFolder = Settings.get<string>(SETTINGS_CONTENT_STATIC_FOLDER);

      const page: Page = {
        ...article.data,
        // FrontMatter properties
        fmFolder: folderTitle,
        fmModified: fileMtime,
        fmFilePath: filePath,
        fmFileName: fileName,
        fmDraft: ContentType.getDraftStatus(article?.data),
        fmYear: article?.data[dateField] ? DateHelper.tryParse(article?.data[dateField])?.getFullYear() : null,
        fmPreviewImage: "",
        // Make sure these are always set
        title: article?.data.title,
        slug: article?.data.slug,
        date: article?.data[dateField] || "",
        draft: article?.data.draft,
        description: article?.data[descriptionField] || "",
      };

      const contentType = ArticleHelper.getContentType(article.data);

      let previewFieldParents = this.findPreviewField(contentType.fields);
      if (previewFieldParents.length === 0) {
        const previewField = contentType.fields.find(field => field.type === "image" && field.name === "preview");
        if (previewField) {
          previewFieldParents = ["preview"];
        }
      }

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

  /**
   * Find the preview field in the fields
   * @param ctFields 
   * @param parents 
   * @returns 
   */
  private static findPreviewField(ctFields: Field[], parents: string[] = []): string[] {
    for (const field of ctFields) {
      if (field.isPreviewImage && field.type === "image") {
        parents = [...parents, field.name];
        return parents;
      } else if (field.type === "fields" && field.fields) {
        const subFields = this.findPreviewField(field.fields);
        if (subFields.length > 0) {
          return [...parents, field.name, ...subFields];
        }
      }
    }

    return parents;
  }
}