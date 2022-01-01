import { isValidFile } from './../helpers/isValidFile';
import { existsSync } from "fs";
import { dirname, join } from "path";
import { commands, FileSystemWatcher, RelativePattern, Uri, workspace } from "vscode";
import { Dashboard } from "../commands/Dashboard";
import { Folders } from "../commands/Folders";
import { COMMAND_NAME, DefaultFields, SETTINGS_CONTENT_STATIC_FOLDER, SETTING_DATE_FIELD, SETTING_SEO_DESCRIPTION_FIELD } from "../constants";
import { DashboardCommand } from "../dashboardWebView/DashboardCommand";
import { DashboardMessage } from "../dashboardWebView/DashboardMessage";
import { Page } from "../dashboardWebView/models";
import { ArticleHelper, Settings } from "../helpers";
import { ContentType } from "../helpers/ContentType";
import { DateHelper } from "../helpers/DateHelper";
import { Notifications } from "../helpers/Notifications";
import { BaseListener } from "./BaseListener";


export class PagesListener extends BaseListener {
  private static watchers: { [path: string]: FileSystemWatcher } = {};

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
      let watcher = workspace.createFileSystemWatcher(new RelativePattern(folderUri, "*"));
      watcher.onDidCreate(async (uri: Uri) => this.getPagesData);
      watcher.onDidDelete(async (uri: Uri) => this.getPagesData);
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

  /**
   * Retrieve all the markdown pages
   */
  private static async getPagesData() {
    const wsFolder = Folders.getWorkspaceFolder();

    const descriptionField = Settings.get(SETTING_SEO_DESCRIPTION_FIELD) as string || DefaultFields.Description;
    const dateField = Settings.get(SETTING_DATE_FIELD) as string || DefaultFields.PublishingDate;
    const staticFolder = Settings.get<string>(SETTINGS_CONTENT_STATIC_FOLDER);

    const folderInfo = await Folders.getInfo();
    const pages: Page[] = [];

    if (folderInfo) {
      for (const folder of folderInfo) {
        for (const file of folder.lastModified) {
          if (isValidFile(file.fileName)) {
            try {
              const article = ArticleHelper.getFrontMatterByPath(file.filePath);

              if (article?.data.title) {
                const page: Page = {
                  ...article.data,
                  // FrontMatter properties
                  fmFolder: folder.title,
                  fmModified: file.mtime,
                  fmFilePath: file.filePath,
                  fmFileName: file.fileName,
                  fmDraft: ContentType.getDraftStatus(article?.data),
                  fmYear: article?.data[dateField] ? DateHelper.tryParse(article?.data[dateField])?.getFullYear() : null,
                  // Make sure these are always set
                  title: article?.data.title,
                  slug: article?.data.slug,
                  date: article?.data[dateField] || "",
                  draft: article?.data.draft,
                  description: article?.data[descriptionField] || "",
                };

                const contentType = ArticleHelper.getContentType(article.data);
                const previewField = contentType.fields.find(field => field.isPreviewImage && field.type === "image")?.name || "preview";

                if (article?.data[previewField] && wsFolder) {
                  let fieldValue = article?.data[previewField];
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
                    const contentFolderPath = join(dirname(file.filePath), fieldValue);

                    let previewUri = null;
                    if (existsSync(staticPath)) {
                      previewUri = Uri.file(staticPath);
                    } else if (existsSync(contentFolderPath)) {
                      previewUri = Uri.file(contentFolderPath);
                    }

                    if (previewUri) {
                      const preview = Dashboard.getWebview()?.asWebviewUri(previewUri);
                      page[previewField] = preview?.toString() || "";
                    } else {
                      page[previewField] = "";
                    }
                  }
                }
      
                pages.push(page);
              }
            } catch (error: any) {
              Notifications.error(`File error: ${file.filePath} - ${error?.message || error}`);
            }
          }
        }
      }
    }

    this.sendMsg(DashboardCommand.pages, pages);
  }

  public static refresh() {
    this.getPagesData();
  }
}