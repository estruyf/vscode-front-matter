import { PagesListener } from './../listeners/PagesListener';
import { ExtensionListener } from './../listeners/ExtensionListener';
import { SETTINGS_DASHBOARD_OPENONSTART, CONTEXT } from '../constants';
import { join } from "path";
import { commands, Uri, ViewColumn, Webview, WebviewPanel, window } from "vscode";
import { Logger, Settings as SettingsHelper } from '../helpers';
import { DashboardCommand } from '../dashboardWebView/DashboardCommand';
import { Extension } from '../helpers/Extension';
import { WebviewHelper } from '@estruyf/vscode';
import { DashboardData } from '../models/DashboardData';
import { ExplorerView } from '../explorerView/ExplorerView';
import { MediaLibrary } from '../helpers/MediaLibrary';
import { DashboardListener, MediaListener, SettingsListener } from '../listeners';

export class Dashboard {
  private static webview: WebviewPanel | null = null;
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
    MediaLibrary.getInstance();
    
    Dashboard._viewData = data;

    if (Dashboard.isOpen) {
			Dashboard.reveal(!!data);
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
  public static reveal(hasData: boolean = false) {
    if (Dashboard.webview) {
      Dashboard.webview.reveal();

      if (hasData) {
        Dashboard.postWebviewMessage({ command: DashboardCommand.viewData, data: Dashboard.viewData });
      }
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
        enableScripts: true,
        retainContextWhenHidden: true
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

        Dashboard.postWebviewMessage({ command: DashboardCommand.viewData, data: null });
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
      Logger.info(`Receiving message from webview: ${msg.command}`);
      
      DashboardListener.process(msg);
      ExtensionListener.process(msg);
      MediaListener.process(msg);
      PagesListener.process(msg);
      SettingsListener.process(msg);
    });
  }

  /**
   * Return the webview
   * @returns The webview
   */
  public static getWebview() {
    return Dashboard.webview?.webview;
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
   * Retrieve the webview HTML contents
   * @param webView 
   */
  private static getWebviewContent(webView: Webview, extensionPath: Uri): string {
    const dashboardFile = "dashboardWebView.js";
    const localServerUrl = "http://localhost:9000";

    let scriptUri = "";
    const isProd = Extension.getInstance().isProductionMode;
    if (isProd) {
      scriptUri = webView.asWebviewUri(Uri.joinPath(extensionPath, 'dist', dashboardFile)).toString();
    } else {
      scriptUri = `${localServerUrl}/${dashboardFile}`; 
    }

    const nonce = WebviewHelper.getNonce();

    const ext = Extension.getInstance();
    const version = ext.getVersion();
    const isBeta = ext.isBetaVersion();

    const csp = [
      `default-src 'none';`,
      `img-src ${`vscode-file://vscode-app`} ${webView.cspSource} https://api.visitorbadge.io 'self' 'unsafe-inline'`,
      `script-src ${isProd ? `'nonce-${nonce}'` : "http://localhost:9000 http://0.0.0.0:9000"}`,
      `style-src ${webView.cspSource} 'self' 'unsafe-inline'`,
      `font-src ${webView.cspSource}`,
      `connect-src https://o1022172.ingest.sentry.io ${isProd ? `` : "ws://localhost:9000 ws://0.0.0.0:9000 http://localhost:9000 http://0.0.0.0:9000"}`
    ];

    return `
      <!DOCTYPE html>
      <html lang="en" style="width:100%;height:100%;margin:0;padding:0;">
      <head>
			  <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="${csp.join('; ')}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>Front Matter Dashboard</title>
      </head>
      <body style="width:100%;height:100%;margin:0;padding:0;overflow:hidden" class="bg-gray-100 text-vulcan-500 dark:bg-vulcan-500 dark:text-whisper-500">
        <div id="app" data-isProd="${isProd}" data-environment="${isBeta ? "BETA" : "main"}" data-version="${version.usedVersion}" style="width:100%;height:100%;margin:0;padding:0;" ${version.usedVersion ? "" : `data-showWelcome="true"`}></div>

        <img style="display:none" src="https://api.visitorbadge.io/api/combined?user=estruyf&repo=frontmatter-usage&countColor=%23263759&slug=${`dashboard-${version.installedVersion}`}" alt="Daily usage" />

        <script ${isProd ? `nonce="${nonce}"` : ""} src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}