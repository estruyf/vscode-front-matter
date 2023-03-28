import {
  ArticleListener,
  ExtensionListener,
  MediaListener,
  ScriptListener,
  TaxonomyListener,
  DataListener,
  SettingsListener
} from './../listeners/panel';
import { SETTING_EXPERIMENTAL, SETTING_EXTENSIBILITY_SCRIPTS, TelemetryEvent } from '../constants';
import {
  CancellationToken,
  Disposable,
  Uri,
  Webview,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
  window
} from 'vscode';
import { Logger, Settings } from '../helpers';
import { Command } from '../panelWebView/Command';
import { TagType } from '../panelWebView/TagType';
import { WebviewHelper } from '@estruyf/vscode';
import { Extension } from '../helpers/Extension';
import { Telemetry } from '../helpers/Telemetry';
import { GitListener, ModeListener } from '../listeners/general';
import { Folders } from '../commands';

export class ExplorerView implements WebviewViewProvider, Disposable {
  public static readonly viewType = 'frontMatter.explorer';
  private static instance: ExplorerView;

  private panel: WebviewView | null = null;
  private disposable: Disposable | null = null;

  private constructor(private readonly extPath: Uri) {}

  /**
   * Creates the singleton instance for the panel
   * @param extPath
   */
  public static getInstance(extPath?: Uri): ExplorerView {
    if (!ExplorerView.instance) {
      ExplorerView.instance = new ExplorerView(extPath as Uri);
    }

    return ExplorerView.instance;
  }

  /**
   * Retrieve the visibility of the webview
   */
  get visible() {
    return this.panel ? this.panel.visible : false;
  }

  /**
   * Webview panel dispose
   */
  public dispose() {
    if (this.disposable) {
      this.disposable.dispose();
    }
  }

  public getWebview() {
    return this.panel?.webview;
  }

  /**
   * Default resolve webview panel
   * @param webviewView
   * @param context
   * @param token
   */
  public async resolveWebviewView(
    webviewView: WebviewView,
    context: WebviewViewResolveContext,
    token: CancellationToken
  ): Promise<void> {
    this.panel = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      enableCommandUris: true
    };

    webviewView.webview.html = this.getWebviewContent(webviewView.webview);

    this.disposable = Disposable.from(
      webviewView.onDidDispose(() => {
        webviewView.webview.html = '';
      }, this)
    );

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      Logger.info(`Receiving message from webview to panel: ${msg.command}`);

      ArticleListener.process(msg);
      DataListener.process(msg);
      ExtensionListener.process(msg);
      MediaListener.process(msg);
      ScriptListener.process(msg);
      SettingsListener.process(msg);
      TaxonomyListener.process(msg);
      ModeListener.process(msg);
      GitListener.process(msg);
    });

    webviewView.onDidChangeVisibility(() => {
      if (this.visible) {
        Telemetry.send(TelemetryEvent.openExplorerView);
        DataListener.getFileData();
      }
    });

    window.onDidChangeActiveTextEditor(() => {
      this.sendMessage({ command: Command.loading, payload: true });

      if (this.visible) {
        DataListener.getFileData();
      }
    }, this);

    Settings.onConfigChange(() => {
      SettingsListener.getSettings();
    });
  }

  /**
   * Post data to the panel
   * @param msg
   */
  public sendMessage(msg: { command: Command; payload?: any }) {
    this.panel?.webview?.postMessage(msg);
  }

  /**
   * Allows the webview panel to focus on tags or categories input
   * @param tagType
   */
  public triggerInputFocus(tagType: TagType) {
    if (tagType === TagType.tags) {
      this.sendMessage({ command: Command.focusOnTags });
    } else {
      this.sendMessage({ command: Command.focusOnCategories });
    }
  }

  /**
   * Trigger all sections to close
   */
  public collapseAll() {
    this.sendMessage({ command: Command.closeSections });
  }

  private counts(acc: any, node: any) {
    // add 1 to an initial or existing value
    acc[node.type] = (acc[node.type] || 0) + 1;

    // find and add up the counts from all of this node's children
    return (node.children || []).reduce(
      (childAcc: any, childNode: any) => this.counts(childAcc, childNode),
      acc
    );
  }

  /**
   * Retrieve the webview HTML contents
   * @param webView
   */
  private getWebviewContent(webView: Webview): string {
    const ext = Extension.getInstance();
    const dashboardFile = 'panelWebView.js';
    const localPort = `9001`;
    const localServerUrl = `localhost:${localPort}`;
    const extensionPath = ext.extensionPath;

    const styleVSCodeUri = webView.asWebviewUri(
      Uri.joinPath(this.extPath, 'assets/media', 'vscode.css')
    );
    const styleResetUri = webView.asWebviewUri(
      Uri.joinPath(this.extPath, 'assets/media', 'reset.css')
    );
    const stylesUri = webView.asWebviewUri(
      Uri.joinPath(this.extPath, 'assets/media', 'styles.css')
    );

    const nonce = WebviewHelper.getNonce();

    const version = ext.getVersion();
    const isBeta = ext.isBetaVersion();

    let scriptUri = '';
    const isProd = Extension.getInstance().isProductionMode;
    if (isProd) {
      scriptUri = webView
        .asWebviewUri(Uri.joinPath(extensionPath, 'dist', dashboardFile))
        .toString();
    } else {
      scriptUri = `http://${localServerUrl}/${dashboardFile}`;
    }

    // Get experimental setting
    const experimental = Settings.get(SETTING_EXPERIMENTAL);
    const extensibilityScripts = Settings.get<string[]>(SETTING_EXTENSIBILITY_SCRIPTS) || [];

    const scriptsToLoad: string[] = [];
    if (experimental) {
      for (const script of extensibilityScripts) {
        if (script.startsWith('https://')) {
          scriptsToLoad.push(script);
        } else {
          const absScriptPath = Folders.getAbsFilePath(script);
          const scriptUri = webView.asWebviewUri(Uri.file(absScriptPath));
          scriptsToLoad.push(scriptUri.toString());
        }
      }
    }

    const csp = [
      `default-src 'none';`,
      `img-src ${`vscode-file://vscode-app`} ${
        webView.cspSource
      } https://api.visitorbadge.io 'self' 'unsafe-inline' https://*`,
      `script-src 'unsafe-eval' https://* ${
        isProd ? `'nonce-${nonce}'` : `http://${localServerUrl} http://0.0.0.0:${localPort}`
      }`,
      `style-src ${webView.cspSource} 'self' 'unsafe-inline' https://*`,
      `font-src ${webView.cspSource}`,
      `connect-src https://o1022172.ingest.sentry.io https://* ${
        isProd
          ? ``
          : `ws://${localServerUrl} ws://0.0.0.0:${localPort} http://${localServerUrl} http://0.0.0.0:${localPort}`
      }`
    ];

    return `
      <!DOCTYPE html>
      <html lang="en-US">
      <head>
        <meta http-equiv="Content-Security-Policy" content="${csp.join('; ')}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleResetUri}" rel="stylesheet">
        <link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${stylesUri}" rel="stylesheet">

        <title>Front Matter Panel</title>
      </head>
      <body>
        <div id="app" data-isProd="${isProd}" data-environment="${
      isBeta ? 'BETA' : 'main'
    }" data-version="${version.usedVersion}"></div>

      ${(scriptsToLoad || [])
        .map((script) => {
          return `<script type="module" src="${script}" nonce="${nonce}"></script>`;
        })
        .join('')}

        <script ${isProd ? `nonce="${nonce}"` : ''} src="${scriptUri}"></script>

        <img style="display:none" src="https://api.visitorbadge.io/api/combined?user=estruyf&repo=frontmatter-usage&countColor=%23263759&slug=${`panel-${version.installedVersion}`}" alt="Daily usage" />
      </body>
      </html>
    `;
  }
}
