import { SETTINGS_CONTENT_STATIC_FOLDERS, SETTING_DATE_FIELD, SETTING_SEO_DESCRIPTION_FIELD, SETTINGS_DASHBOARD_OPENONSTART } from './../constants/settings';
import { ArticleHelper } from './../helpers/ArticleHelper';
import { basename, dirname, extname, join } from "path";
import { existsSync, statSync, unlinkSync, writeFileSync } from "fs";
import { commands, Uri, ViewColumn, Webview, WebviewPanel, window, workspace, env } from "vscode";
import { Settings as SettingsHelper } from '../helpers';
import { TaxonomyType } from '../models';
import { Folders } from './Folders';
import { DashboardCommand } from '../dashboardWebView/DashboardCommand';
import { DashboardMessage } from '../dashboardWebView/DashboardMessage';
import { Page } from '../dashboardWebView/models/Page';
import { openFileInEditor } from '../helpers/openFileInEditor';
import { COMMAND_NAME, EXTENSION_STATE_PAGES_VIEW } from '../constants/Extension';
import { Template } from './Template';
import { Notifications } from '../helpers/Notifications';
import { Settings } from '../dashboardWebView/models/Settings';
import { Extension } from '../helpers/Extension';
import { parseJSON } from 'date-fns';
import { ViewType } from '../dashboardWebView/state';
import { EditorHelper, WebviewHelper } from '@estruyf/vscode';
import { MediaInfo, MediaPaths } from './../models/MediaPaths';
import { decodeBase64Image } from '../helpers/decodeBase64Image';
import { DefaultFields } from '../constants';
import { DashboardData } from '../models/DashboardData';
import { ExplorerView } from '../explorerView/ExplorerView';


export class Dashboard {
  private static webview: WebviewPanel | null = null;
  private static isDisposed: boolean = true;
  private static media: MediaInfo[] = [];
  private static timers: { [folder: string]: any } = {};
  private static _viewData: DashboardData | undefined;

  public static get viewData(): DashboardData | undefined {
    return Dashboard._viewData;
  }

  /** 
   * Init the dashboard
   */
  public static async init() {
    const config = SettingsHelper.getConfig();
    const openOnStartup = config.get(SETTINGS_DASHBOARD_OPENONSTART);
    if (openOnStartup) {
      Dashboard.open();
    }
  }

  /**
   * Open or reveal the dashboard
   */
  public static async open(data?: DashboardData) {
    Dashboard._viewData = data;

    if (Dashboard.isOpen) {
			Dashboard.reveal();
		} else {
			Dashboard.create();
		}
  }

  /**
   * Check if the dashboard is still open
   */
  public static get isOpen(): boolean {
    return !Dashboard.isDisposed;
  }

  /**
   * Reveal the dashboard if it is open
   */
  public static reveal() {
    if (Dashboard.webview) {
      Dashboard.webview.reveal();
    }
  }
  
  /**
   * Create the dashboard webview
   */
  public static async create() {
    const extensionUri = Extension.getInstance().extensionPath;

    // Create the preview webview
    Dashboard.webview = window.createWebviewPanel(
      'frontMatterDashboard',
      'FrontMatter Dashboard',
      ViewColumn.One,
      {
        enableScripts: true
      }
    );

    Dashboard.isDisposed = false;

    Dashboard.webview.iconPath = {
      dark: Uri.file(join(extensionUri.fsPath, 'assets/frontmatter-dark.svg')),
      light: Uri.file(join(extensionUri.fsPath, 'assets/frontmatter.svg'))
    };

    Dashboard.webview.webview.html = Dashboard.getWebviewContent(Dashboard.webview.webview, extensionUri);

    Dashboard.webview.onDidChangeViewState(() => {
      if (!this.webview?.visible) {
        Dashboard._viewData = undefined;
        const panel = ExplorerView.getInstance(extensionUri);
        panel.getMediaSelection();
      }
    });

    Dashboard.webview.onDidDispose(() => {
      Dashboard.isDisposed = true;
      Dashboard._viewData = undefined;
      const panel = ExplorerView.getInstance(extensionUri);
      panel.getMediaSelection();
    });

    workspace.onDidChangeConfiguration(() => {
      Dashboard.getSettings();
    });

    workspace.onDidChangeTextDocument((e) => {
      if (e.document.fileName === "frontmatter.json") {
        console.log("frontmatter.json changed");
      }
    });

    Dashboard.webview.webview.onDidReceiveMessage(async (msg) => {
      switch(msg.command) {
        case DashboardMessage.getViewType:
          if (Dashboard._viewData) {
            Dashboard.postWebviewMessage({ command: DashboardCommand.viewData, data: Dashboard._viewData });
          }
          break;
        case DashboardMessage.getData:
          Dashboard.getSettings();
          Dashboard.getPages();
          break;
        case DashboardMessage.openFile:
          openFileInEditor(msg.data);
          break;
        case DashboardMessage.createContent:
          await commands.executeCommand(COMMAND_NAME.createContent);
          break;
        case DashboardMessage.updateSetting:
          Dashboard.updateSetting(msg.data);
          break;
        case DashboardMessage.initializeProject:
          await commands.executeCommand(COMMAND_NAME.init, Dashboard.getSettings);
          break;
        case DashboardMessage.reload:
          if (!Dashboard.isDisposed) {
            Dashboard.webview?.dispose();
            setTimeout(() => {
              Dashboard.open();
            }, 100);
          }
          break;
        case DashboardMessage.setPageViewType:
          Extension.getInstance().setState(EXTENSION_STATE_PAGES_VIEW, msg.data);
          break;
        case DashboardMessage.getMedia:
          Dashboard.getMedia(msg?.data?.page, msg?.data?.folder)
          break;
        case DashboardMessage.copyToClipboard:
          env.clipboard.writeText(msg.data);
          break;
        case DashboardMessage.refreshMedia:
          Dashboard.media = [];
          Dashboard.getMedia(0, msg?.data?.folder);
          break;
        case DashboardMessage.uploadMedia:
          Dashboard.saveFile(msg?.data);
          break;
        case DashboardMessage.deleteMedia:
          Dashboard.deleteFile(msg?.data);
          break;
        case DashboardMessage.insertPreviewImage:
          if (msg.data?.file && msg.data?.image) {
            await commands.executeCommand(`workbench.view.extension.frontmatter-explorer`);
            await EditorHelper.showFile(msg.data.file);
            Dashboard._viewData = undefined;
            const panel = ExplorerView.getInstance(extensionUri);
            panel.getMediaSelection();
            panel.updateMetadata({field: msg.data.fieldName, value: msg.data.image});
          }
          break;
      }
    });
  }

  /**
   * Retrieve the settings for the dashboard
   */
  private static async getSettings() { 
    const ext = Extension.getInstance();
    const config = SettingsHelper.getConfig();
    const wsFolder = Folders.getWorkspaceFolder();
    
    Dashboard.postWebviewMessage({
      command: DashboardCommand.settings,
      data: {
        beta: ext.isBetaVersion(),
        wsFolder: wsFolder ? wsFolder.fsPath : '',
        staticFolder: config.get<string>(SETTINGS_CONTENT_STATIC_FOLDERS),
        folders: Folders.get(),
        initialized: await Template.isInitialized(),
        tags: SettingsHelper.getTaxonomy(TaxonomyType.Tag),
        categories: SettingsHelper.getTaxonomy(TaxonomyType.Category),
        openOnStart: config.get(SETTINGS_DASHBOARD_OPENONSTART),
        versionInfo: ext.getVersion(),
        pageViewType: await ext.getState<ViewType | undefined>(EXTENSION_STATE_PAGES_VIEW)
      } as Settings
    });
  }

  /**
   * Update a setting from the dashboard
   */
  private static async updateSetting(data: { name: string, value: any }) {
    await SettingsHelper.updateSetting(data.name, data.value);
    Dashboard.getSettings();
  }

  /**
   * Retrieve all media files
   */
  private static async getMedia(page: number = 0, folder: string = '') {
    const wsFolder = Folders.getWorkspaceFolder();
    const config = SettingsHelper.getConfig();
    const staticFolder = config.get<string>(SETTINGS_CONTENT_STATIC_FOLDERS);

    if (Dashboard.media.length === 0) {
      const contentFolder = Folders.get();
      let allMedia: MediaInfo[] = [];

      if (staticFolder) {
        const files = await workspace.findFiles(`${staticFolder || ""}/**/*`);
        const media = Dashboard.filterMedia(files);

        allMedia = [...media];
      }

      if (contentFolder && wsFolder) {
        for (let i = 0; i < contentFolder.length; i++) {
          const folder = contentFolder[i];
          const relFolderPath = folder.path.substring(wsFolder.fsPath.length + 1);
          const files = await workspace.findFiles(`${relFolderPath}/**/*`);
          const media = Dashboard.filterMedia(files);
    
          allMedia = [...allMedia, ...media];
        }
      }

      allMedia = allMedia.sort((a, b) => {
        if (b.fsPath < a.fsPath) {
          return -1;
        }
        if (b.fsPath > a.fsPath) {
          return 1;
        }
        return 0;
      });

      Dashboard.media = Object.assign([], allMedia);
    }

    // Filter the media
    let files: MediaInfo[] = Dashboard.media;
    if (folder) {
      files = files.filter(f => f.fsPath.includes(folder));
    }

    // Retrieve the total after filtering and before the slicing happens
    const total = files.length;

    // Get media set
    files = files.slice(page * 16, ((page + 1) * 16));
    files = files.map((file) => {
      try {
        return {
          ...file,
          stats: statSync(file.fsPath)
        };
      } catch (e) {
        return {...file, stats: undefined};
      }
    }).filter(f => f.stats !== undefined);

    const folders = [...new Set(Dashboard.media.map((file) => {
      let relFolderPath = wsFolder ? file.fsPath.substring(wsFolder.fsPath.length + 1) : file.fsPath;
      if (staticFolder && relFolderPath.startsWith(staticFolder)) {
        relFolderPath = relFolderPath.substring(staticFolder.length);
      }
      if (relFolderPath?.startsWith('/')) {
        relFolderPath = relFolderPath.substring(1);
      }
      return dirname(relFolderPath);
    }))];

    Dashboard.postWebviewMessage({
      command: DashboardCommand.media,
      data: {
        media: files,
        total: total,
        folders
      } as MediaPaths
    });
  }

  /**
   * Retrieve all the markdown pages
   */
  private static async getPages() {
    const config = SettingsHelper.getConfig();
    const wsFolder = Folders.getWorkspaceFolder();

    const descriptionField = config.get(SETTING_SEO_DESCRIPTION_FIELD) as string || DefaultFields.Description;
    const dateField = config.get(SETTING_DATE_FIELD) as string || DefaultFields.PublishingDate;
    const staticFolder = config.get<string>(SETTINGS_CONTENT_STATIC_FOLDERS);

    const folderInfo = await Folders.getInfo();
    const pages: Page[] = [];

    if (folderInfo) {
      for (const folder of folderInfo) {
        for (const file of folder.lastModified) {
          if (file.fileName.endsWith(`.md`) || file.fileName.endsWith(`.mdx`)) {
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
                  fmDraft: article?.data.draft ? "Draft" : "Published",
                  fmYear: article?.data[dateField] ? parseJSON(article?.data[dateField]).getFullYear() : null,
                  // Make sure these are always set
                  title: article?.data.title,
                  slug: article?.data.slug,
                  date: article?.data[dateField] || "",
                  draft: article?.data.draft,
                  description: article?.data[descriptionField] || "",
                };
      
                if (article?.data.preview && wsFolder) {
                  const staticPath = join(wsFolder.fsPath, staticFolder || "", article?.data.preview);
                  const contentFolderPath = join(dirname(file.filePath), article?.data.preview);

                  let previewUri = null;
                  if (existsSync(staticPath)) {
                    previewUri = Uri.file(staticPath);
                  } else if (existsSync(contentFolderPath)) {
                    previewUri = Uri.file(contentFolderPath);
                  }

                  if (previewUri) {
                    const preview = Dashboard.webview?.webview.asWebviewUri(previewUri);
                    page.preview = preview?.toString() || "";
                  } else {
                    page.preview = "";
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

    Dashboard.postWebviewMessage({
      command: DashboardCommand.pages,
      data: pages
    });
  }

  /**
   * Filter the media files
   */
  private static filterMedia(files: Uri[]) {
    return files.filter(file => {
      const ext = extname(file.fsPath);
      return ['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext);
    }).map((file) => ({
      fsPath: file.fsPath,
      vsPath: Dashboard.webview?.webview.asWebviewUri(file).toString(),
      stats: undefined
    } as MediaInfo));
  }

  /**
   * Save the dropped file in the current folder
   * @param fileData 
   */
  private static async saveFile({fileName, contents, folder}: { fileName: string; contents: string; folder: string | null }) {
    if (fileName && contents) {
      const wsFolder = Folders.getWorkspaceFolder();
      const config = SettingsHelper.getConfig();
      const staticFolder = config.get<string>(SETTINGS_CONTENT_STATIC_FOLDERS);
      const wsPath = wsFolder ? wsFolder.fsPath : "";
      let absFolderPath = join(wsPath, staticFolder || "", folder || "");

      if (!existsSync(absFolderPath)) {
        absFolderPath = join(wsPath, folder || "");
      }

      if (!existsSync(absFolderPath)) {
        Notifications.error(`We couldn't find your selected folder.`);
        return;
      }

      const staticPath = join(absFolderPath, fileName);
      const imgData = decodeBase64Image(contents);

      if (imgData) {
        writeFileSync(staticPath, imgData.data);
        Notifications.info(`File ${fileName} uploaded to: ${staticFolder}/${folder}`);
        
        const folderPath = `${staticFolder}/${folder}`;
        if (Dashboard.timers[folderPath]) {
          clearTimeout(Dashboard.timers[folderPath]);
          delete Dashboard.timers[folderPath];
        }
        
        Dashboard.timers[folderPath] = setTimeout(() => {
          Dashboard.media = [];
          Dashboard.getMedia(0, folder || "");
          delete Dashboard.timers[folderPath];
        }, 500);
      } else {
        Notifications.error(`Something went wrong uploading ${fileName}`);
      }
    }
  }

  /**
   * Delete the selected file
   * @param fileData 
   */
  private static async deleteFile({ file, page, folder }: { file: string; page: number; folder: string | null; }) {
    if (!file) {
      return;
    }

    try {
      unlinkSync(file);

      Dashboard.media = [];
      Dashboard.getMedia(page || 0, folder || "");
    } catch(err) {
      Notifications.error(`Something went wrong deleting ${basename(file)}`);
    }
  }

  /**
   * Post data to the dashboard
   * @param msg 
   */
  private static postWebviewMessage(msg: { command: DashboardCommand, data?: any }) {
    Dashboard.webview?.webview.postMessage(msg);
  }
  
  /**
   * Retrieve the webview HTML contents
   * @param webView 
   */
  private static getWebviewContent(webView: Webview, extensionPath: Uri): string {
    const scriptUri = webView.asWebviewUri(Uri.joinPath(extensionPath, 'dist', 'pages.js'));

    const nonce = WebviewHelper.getNonce();

    const version = Extension.getInstance().getVersion();

    return `
      <!DOCTYPE html>
      <html lang="en" style="width:100%;height:100%;margin:0;padding:0;">
      <head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${`vscode-file://vscode-app`} ${webView.cspSource} https://api.visitorbadge.io 'self' 'unsafe-inline'; script-src 'nonce-${nonce}'; style-src ${webView.cspSource} 'self' 'unsafe-inline'; font-src ${webView.cspSource}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>Front Matter Dashboard</title>
      </head>
      <body style="width:100%;height:100%;margin:0;padding:0;overflow:hidden" class="bg-gray-100 text-vulcan-500 dark:bg-vulcan-500 dark:text-whisper-500">
        <div id="app" style="width:100%;height:100%;margin:0;padding:0;" ${version.usedVersion ? "" : `data-showWelcome="true"`}></div>

        <img style="display:none" src="https://api.visitorbadge.io/api/combined?user=estruyf&repo=frontmatter-usage&countColor=%23263759&slug=${`dashboard-${version.installedVersion}`}" alt="Daily usage" />

        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}