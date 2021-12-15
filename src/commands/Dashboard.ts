import { SETTINGS_CONTENT_STATIC_FOLDER, SETTING_DATE_FIELD, SETTING_SEO_DESCRIPTION_FIELD, SETTINGS_DASHBOARD_OPENONSTART, SETTINGS_DASHBOARD_MEDIA_SNIPPET, SETTING_TAXONOMY_CONTENT_TYPES, DefaultFields, HOME_PAGE_NAVIGATION_ID, ExtensionState, COMMAND_NAME, SETTINGS_FRAMEWORK_ID, SETTINGS_CONTENT_DRAFT_FIELD, SETTINGS_CONTENT_SORTING, CONTEXT, SETTING_CUSTOM_SCRIPTS, SETTINGS_CONTENT_SORTING_DEFAULT, SETTINGS_MEDIA_SORTING_DEFAULT } from '../constants';
import { ArticleHelper } from './../helpers/ArticleHelper';
import { basename, dirname, extname, join, parse } from "path";
import { existsSync, readdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import { commands, Uri, ViewColumn, Webview, WebviewPanel, window, workspace, env, Position } from "vscode";
import { Settings as SettingsHelper } from '../helpers';
import { CustomScript as ICustomScript, DraftField, Framework, ScriptType, SortingSetting, SortOrder, SortType, TaxonomyType } from '../models';
import { Folders } from './Folders';
import { DashboardCommand } from '../dashboardWebView/DashboardCommand';
import { DashboardMessage } from '../dashboardWebView/DashboardMessage';
import { Page } from '../dashboardWebView/models/Page';
import { openFileInEditor } from '../helpers/openFileInEditor';
import { Template } from './Template';
import { Notifications } from '../helpers/Notifications';
import { Extension } from '../helpers/Extension';
import { EditorHelper, WebviewHelper } from '@estruyf/vscode';
import { MediaInfo, MediaPaths } from './../models/MediaPaths';
import { decodeBase64Image } from '../helpers/decodeBase64Image';
import { DashboardData } from '../models/DashboardData';
import { ExplorerView } from '../explorerView/ExplorerView';
import { MediaLibrary } from '../helpers/MediaLibrary';
import { parseWinPath } from '../helpers/parseWinPath';
import { DateHelper } from '../helpers/DateHelper';
import { FrameworkDetector } from '../helpers/FrameworkDetector';
import { ContentType } from '../helpers/ContentType';
import { SortingOption } from '../dashboardWebView/models';
import { Sorting } from '../helpers/Sorting';
import imageSize from 'image-size';
import { CustomScript } from '../helpers/CustomScript';
import { DashboardListener, SettingsListener } from '../listeners';

export class Dashboard {
  private static webview: WebviewPanel | null = null;
  private static mediaLib: MediaLibrary;
  private static _viewData: DashboardData | undefined;
  private static isDisposed: boolean = true;

  public static get viewData(): DashboardData | undefined {
    return Dashboard._viewData;
  }

  /**
   * Init the dashboard
   */
  public static async init() {
    const openOnStartup = SettingsHelper.get(SETTINGS_DASHBOARD_OPENONSTART);
    if (openOnStartup) {
      Dashboard.open();
    }
  }

  /**
   * Open or reveal the dashboard
   */
  public static async open(data?: DashboardData) {
    this.mediaLib = MediaLibrary.getInstance();
    
    Dashboard._viewData = data;

    if (Dashboard.isOpen) {
			Dashboard.reveal();
		} else {
			Dashboard.create();
		}

    await commands.executeCommand('setContext', CONTEXT.isDashboardOpen, true);
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

  public static close() {
    Dashboard.webview?.dispose();
  }

  public static reload() {
    if (Dashboard.isOpen) {
      Dashboard.webview?.dispose();

      setTimeout(() => {
        Dashboard.open();
      }, 100);
    }
  }

  public static resetViewData() {
    Dashboard._viewData = undefined;
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
      dark: Uri.file(join(extensionUri.fsPath, 'assets/icons/frontmatter-short-dark.svg')),
      light: Uri.file(join(extensionUri.fsPath, 'assets/icons/frontmatter-short-light.svg'))
    };

    Dashboard.webview.webview.html = Dashboard.getWebviewContent(Dashboard.webview.webview, extensionUri);

    Dashboard.webview.onDidChangeViewState(async () => {
      if (!this.webview?.visible) {
        Dashboard._viewData = undefined;
        const panel = ExplorerView.getInstance(extensionUri);
        panel.getMediaSelection();
      }

      await commands.executeCommand('setContext', CONTEXT.isDashboardOpen, this.webview?.visible);
    });

    Dashboard.webview.onDidDispose(async () => {
      Dashboard.isDisposed = true;
      Dashboard._viewData = undefined;
      const panel = ExplorerView.getInstance(extensionUri);
      panel.getMediaSelection();
      await commands.executeCommand('setContext', CONTEXT.isDashboardOpen, false);
    });

    SettingsHelper.onConfigChange((global?: any) => {
      SettingsListener.getSettings();
    });

    Dashboard.webview.webview.onDidReceiveMessage(async (msg) => {
      DashboardListener.process(msg);



      switch(msg.command) {
        
        
        
        
        
        case DashboardMessage.insertPreviewImage:
          Dashboard.insertImage(msg?.data);
          break;
        case DashboardMessage.updateMediaMetadata:
          Dashboard.updateMediaMetadata(msg?.data);
          break;
        case DashboardMessage.createMediaFolder:
          await commands.executeCommand(COMMAND_NAME.createFolder, msg?.data);
          break;
        case DashboardMessage.setFramework:
          Dashboard.setFramework(msg?.data);
          break;
        case DashboardMessage.runCustomScript:
          CustomScript.run(msg?.data?.script, msg?.data?.path);
          break;
        case DashboardMessage.setState:
          if (msg?.data?.key && msg?.data?.value) {
            Extension.getInstance().setState(msg?.data?.key, msg?.data?.value, "workspace");
          }
          break;
      }
    });
  }

  /**
   * Return the webview
   * @returns The webview
   */
  public static getWebview() {
    return Dashboard.webview?.webview;
  }

  public static switchFolder(folderPath: string) {
    Dashboard.resetMedia();
    Dashboard.getMedia(0, folderPath);
  }

  /**
   * Post data to the dashboard
   * @param msg 
   */
  public static postWebviewMessage(msg: { command: DashboardCommand, data?: any }) {
    if (Dashboard.isDisposed) {
      return;
    }

    if (Dashboard.webview) {
      Dashboard.webview?.webview.postMessage(msg);
    }
  }

  /**
   * Set the current site-generator or framework + related settings
   * @param frameworkId 
   */
  private static setFramework(frameworkId: string | null) {
    SettingsHelper.update(SETTINGS_FRAMEWORK_ID, frameworkId, true);

    if (frameworkId) {
      const allFrameworks = FrameworkDetector.getAll();
      const framework = allFrameworks.find((f: Framework) => f.name === frameworkId);
      if (framework) {
        SettingsHelper.update(SETTINGS_CONTENT_STATIC_FOLDER, framework.static, true);
      } else {
        SettingsHelper.update(SETTINGS_CONTENT_STATIC_FOLDER, "", true);
      }
    }
  }

  /**
   * Update the metadata of the selected file
   */
  private static async updateMediaMetadata({ file, filename, page, folder, ...metadata }: { file:string; filename:string; page: number; folder: string | null; metadata: any; }) {
    Dashboard.mediaLib.set(file, metadata);

    // Check if filename needs to be updated
    Dashboard.mediaLib.updateFilename(file, filename);

    Dashboard.getMedia(page || 0, folder || "");
  }
  
  /**
   * Retrieve the webview HTML contents
   * @param webView 
   */
  private static getWebviewContent(webView: Webview, extensionPath: Uri): string {
    const scriptUri = webView.asWebviewUri(Uri.joinPath(extensionPath, 'dist', 'pages.js'));

    const nonce = WebviewHelper.getNonce();

    const ext = Extension.getInstance();
    const version = ext.getVersion();
    const isBeta = ext.isBetaVersion();

    return `
      <!DOCTYPE html>
      <html lang="en" style="width:100%;height:100%;margin:0;padding:0;">
      <head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${`vscode-file://vscode-app`} ${webView.cspSource} https://api.visitorbadge.io 'self' 'unsafe-inline'; script-src 'nonce-${nonce}'; style-src ${webView.cspSource} 'self' 'unsafe-inline'; font-src ${webView.cspSource}; connect-src https://o1022172.ingest.sentry.io">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>Front Matter Dashboard</title>
      </head>
      <body style="width:100%;height:100%;margin:0;padding:0;overflow:hidden" class="bg-gray-100 text-vulcan-500 dark:bg-vulcan-500 dark:text-whisper-500">
        <div id="app" data-environment="${isBeta ? "BETA" : "main"}" data-version="${version.usedVersion}" style="width:100%;height:100%;margin:0;padding:0;" ${version.usedVersion ? "" : `data-showWelcome="true"`}></div>

        <img style="display:none" src="https://api.visitorbadge.io/api/combined?user=estruyf&repo=frontmatter-usage&countColor=%23263759&slug=${`dashboard-${version.installedVersion}`}" alt="Daily usage" />

        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}