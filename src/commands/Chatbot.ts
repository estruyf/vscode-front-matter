import { PreviewCommands, GeneralCommands } from './../constants';
import { join } from 'path';
import { commands, Uri, ViewColumn, window } from 'vscode';
import { Extension } from '../helpers';
import { WebviewHelper } from '@estruyf/vscode';
import { getLocalizationFile } from '../utils/getLocalizationFile';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';
import { getWebviewJsFiles } from '../utils';

export class Chatbot {
  /**
   * Open the Chatbot in the editor
   */
  public static async open(extensionPath: string) {
    // Create the preview webview
    const webView = window.createWebviewPanel(
      'frontMatterChatbot',
      `Front Matter AI - ${l10n.t(LocalizationKey.commandsChatbotTitle)}`,
      {
        viewColumn: ViewColumn.Beside,
        preserveFocus: true
      },
      {
        enableScripts: true
      }
    );

    webView.iconPath = {
      dark: Uri.file(join(extensionPath, 'assets/icons/frontmatter-short-dark.svg')),
      light: Uri.file(join(extensionPath, 'assets/icons/frontmatter-short-light.svg'))
    };

    const cspSource = webView.webview.cspSource;

    webView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case PreviewCommands.toVSCode.open:
          if (message.data) {
            commands.executeCommand('vscode.open', message.data);
          }
          return;
        case GeneralCommands.toVSCode.getLocalization:
          const { requestId } = message;
          if (!requestId) {
            return;
          }

          const fileContents = await getLocalizationFile();

          webView.webview.postMessage({
            command: GeneralCommands.toVSCode.getLocalization,
            requestId,
            payload: fileContents
          });
          return;
      }
    });

    const webviewFile = 'dashboard.main.js';
    const localPort = `9000`;
    const localServerUrl = `localhost:${localPort}`;

    const nonce = WebviewHelper.getNonce();

    const ext = Extension.getInstance();
    const isProd = ext.isProductionMode;
    const version = ext.getVersion();
    const isBeta = ext.isBetaVersion();

    const csp = [
      `default-src 'none';`,
      `img-src ${cspSource} http: https:;`,
      `script-src ${
        isProd ? `'nonce-${nonce}'` : `http://${localServerUrl} http://0.0.0.0:${localPort}`
      } 'unsafe-eval'`,
      `style-src ${cspSource} 'self' 'unsafe-inline' http: https:`,
      `connect-src https://* ${
        isProd
          ? ``
          : `ws://${localServerUrl} ws://0.0.0.0:${localPort} http://${localServerUrl} http://0.0.0.0:${localPort}`
      }`
    ];

    let scriptUris = [];
    if (isProd) {
      scriptUris = await getWebviewJsFiles('dashboard', webView.webview);
    } else {
      scriptUris.push(`http://${localServerUrl}/${webviewFile}`);
    }

    // By default, the chatbot is seen as experimental
    const experimental = true;

    webView.webview.html = `
      <!DOCTYPE html>
      <html lang="en" style="width:100%;height:100%;margin:0;padding:0;">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy" content="${csp.join('; ')}">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">

          <title>Front Matter Docs Chatbot</title>
        </head>
        <body style="width:100%;height:100%;margin:0;padding:0;overflow:hidden">
          <div id="app" data-type="chatbot" data-isProd="${isProd}" data-environment="${
      isBeta ? 'BETA' : 'main'
    }" data-version="${version.usedVersion}" ${
      experimental ? `data-experimental="${experimental}"` : ''
    } style="width:100%;height:100%;margin:0;padding:0;"></div>

          ${scriptUris
            .map((uri) => `<script ${isProd ? `nonce="${nonce}"` : ''} src="${uri}"></script>`)
            .join('\n')}

          <img style="display:none" src="https://api.visitorbadge.io/api/combined?user=estruyf&repo=frontmatter-usage&countColor=%23263759&slug=${`chatbot-${version.installedVersion}`}" alt="Daily usage" />
        </body>
      </html>
    `;
  }
}
