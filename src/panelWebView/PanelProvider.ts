import {
  ArticleListener,
  ExtensionListener,
  MediaListener,
  ScriptListener,
  TaxonomyListener,
  DataListener,
  SettingsListener,
  FieldsListener,
  LocalizationListener
} from './../listeners/panel';
import { SETTING_EXPERIMENTAL, SETTING_PANEL_OPEN_ON_SUPPORTED_FILE } from '../constants';
import {
  CancellationToken,
  commands,
  Disposable,
  Uri,
  Webview,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
  window
} from 'vscode';
import { ArticleHelper, Logger, Settings } from '../helpers';
import { Command } from '../panelWebView/Command';
import { TagType } from '../panelWebView/TagType';
import { WebviewHelper } from '@estruyf/vscode';
import { Extension } from '../helpers/Extension';
import { Telemetry } from '../helpers/Telemetry';
import { GitListener, ModeListener } from '../listeners/general';
import { basename } from 'path';
import { getExtensibilityScripts, getWebviewJsFiles, ignoreMsgCommand } from '../utils';

export class PanelProvider implements WebviewViewProvider, Disposable {
  public static readonly viewType = 'frontMatter.explorer';
  private static instance: PanelProvider;

  private panel: WebviewView | null = null;
  private disposable: Disposable | null = null;

  private constructor(private readonly extPath: Uri) {}

  /**
   * Creates the singleton instance for the panel
   * @param extPath
   */
  public static getInstance(extPath?: Uri): PanelProvider {
    if (!PanelProvider.instance) {
      PanelProvider.instance = new PanelProvider(extPath as Uri);
    }

    return PanelProvider.instance;
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

    webviewView.webview.html = await this.getWebviewContent(webviewView.webview);

    this.disposable = Disposable.from(
      webviewView.onDidDispose(() => {
        webviewView.webview.html = '';
      }, this)
    );

    this.updateCurrentFile();

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (!ignoreMsgCommand(msg.command)) {
        Logger.info(`Receiving message from panel: ${msg.command}`);
      }

      LocalizationListener.process(msg);
      FieldsListener.process(msg);
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
        DataListener.getFileData();
      }
    });

    window.onDidChangeActiveTextEditor(() => {
      this.sendMessage({ command: Command.loading, payload: true });

      if (this.visible) {
        DataListener.getFileData();
      }
    }, this);

    Settings.attachListener('panel-listener', () => {
      SettingsListener.getSettings();
    });
  }

  /**
   * Opens the panel if the active file is supported.
   *
   * @returns {Promise<void>} A promise that resolves when the command execution is complete.
   */
  public static async openOnSupportedFile(): Promise<void> {
    const openPanel = Settings.get<boolean>(SETTING_PANEL_OPEN_ON_SUPPORTED_FILE);
    if (openPanel) {
      const activeFile = ArticleHelper.getActiveFile();
      if (activeFile) {
        await commands.executeCommand('frontMatter.explorer.focus');
      }
    }
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

  /**
   * On view change, update the current file that is loaded to show the correct data
   */
  public async updateCurrentFile() {
    const crntPanel = PanelProvider.getInstance();
    if (!crntPanel.visible) {
      return;
    }

    const filePath = ArticleHelper.getActiveFile();
    if (filePath) {
      const article = await ArticleHelper.getFrontMatterByPath(filePath);
      DataListener.pushMetadata(article?.data);

      const fileName = basename(filePath);
      crntPanel.updateTitle(fileName);
    } else {
      crntPanel.updateTitle(undefined);
    }
  }

  /**
   * Update the title of the panel
   * @param title
   * @returns
   */
  private updateTitle(title: string | undefined) {
    if (!this.panel) {
      return;
    }

    if (!title) {
      this.panel.title = 'General';
      return;
    }

    this.panel.title = title;
  }

  /**
   * Retrieve the webview HTML contents
   * @param webView
   */
  private async getWebviewContent(webView: Webview): Promise<string> {
    const ext = Extension.getInstance();
    const webviewFile = 'panel.main.js';
    const localPort = `9001`;
    const localServerUrl = `localhost:${localPort}`;

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

    const isProd = Extension.getInstance().isProductionMode;
    let scriptUris = [];
    if (isProd) {
      scriptUris = await getWebviewJsFiles('panel', webView);
    } else {
      scriptUris.push(`http://${localServerUrl}/${webviewFile}`);
    }

    // Get experimental setting
    const experimental = Settings.get(SETTING_EXPERIMENTAL);

    const scriptsToLoad: string[] = getExtensibilityScripts(webView);

    const csp = [
      `default-src 'none';`,
      `img-src ${`vscode-file://vscode-app`} ${
        webView.cspSource
      } https://api.visitorbadge.io 'self' 'unsafe-inline' https://*`,
      `script-src 'unsafe-eval' https://* ${
        isProd ? `'nonce-${nonce}'` : `http://${localServerUrl} http://0.0.0.0:${localPort}`
      }`,
      `style-src ${webView.cspSource} 'self' 'unsafe-inline' https://*`,
      `font-src ${webView.cspSource} data:;`,
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
    }" data-version="${version.usedVersion}" ${
      experimental ? `data-experimental="${experimental}"` : ''
    } data-is-crash-disabled="${!Telemetry.isVscodeEnabled()}"></div>

      ${(scriptsToLoad || [])
        .map((script) => {
          return `<script type="module" src="${script}" nonce="${nonce}"></script>`;
        })
        .join('')}

        ${scriptUris
          .map((uri) => `<script ${isProd ? `nonce="${nonce}"` : ''} src="${uri}"></script>`)
          .join('\n')}

        <img style="display:none" src="https://api.visitorbadge.io/api/combined?user=estruyf&repo=frontmatter-usage&countColor=%23263759&slug=${`panel-${version.installedVersion}`}" alt="Daily usage" />
      </body>
      </html>
    `;
  }
}
