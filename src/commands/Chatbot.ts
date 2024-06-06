import { Telemetry } from './../helpers/Telemetry';
import { TelemetryEvent, PreviewCommands, GeneralCommands, WEBSITE_LINKS, COMMAND_NAME } from './../constants';
import { join } from 'path';
import {
  CancellationToken,
  chat,
  ChatContext,
  ChatRequest,
  ChatResponseStream,
  commands,
  LanguageModelChatMessage,
  lm,
  Uri,
  ViewColumn,
  window
} from 'vscode';
import { Extension } from '../helpers';
import { WebviewHelper } from '@estruyf/vscode';
import { getLocalizationFile } from '../utils/getLocalizationFile';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';
import { Folders } from '.';

export class Chatbot {
  private static company: string;
  private static chatId: number;

  public static async register() {
    const fmChat = chat.createChatParticipant('frontMatter.chat', this.handler);
    fmChat.iconPath = Uri.joinPath(
      Extension.getInstance().extensionPath,
      '/assets/icons/frontmatter-short-teal.svg'
    );
  }

  private static async handler(
    request: ChatRequest,
    context: ChatContext,
    stream: ChatResponseStream,
    token: CancellationToken
  ) {
    const { command, prompt } = request;

    if (command === 'docs' && prompt) {
      if (!this.chatId || !this.company) {
        stream.progress('Initializing the Front Matter AI...');

        await this.initChat();
      }

      if (!this.company || !this.chatId) {
        this.showAiError(stream);
        return;
      }

      stream.progress('Fetching information from the docs...');

      const data: {
        answer: string;
        answerId: number;
        sources: string[];
      } = await this.retrieveDocs(prompt);

      if (!data.answer) {
        this.showAiError(stream);
        return;
      }

      stream.markdown(data.answer);
    } else if (command === 'create') {
      stream.progress(`Checking your configuration...`);

      const messages = [LanguageModelChatMessage.User(`You are a kind and helpful assistant named Front Matter AI. You aim to provide support in managing Front Matter CMS and its content. If you don't know the answer to a question, you will guide the user to the documentation (https://frontmatter.codes/docs). You can use the "https://frontmatter.codes/docs" link as a reference. When returning code you will surround it in a MD code block, not HTML.`)];
      
      messages.push(LanguageModelChatMessage.User(request.prompt));

      const [model] = await lm.selectChatModels({ vendor: 'copilot', family: 'gpt-4' });

      try {
        const chatResponse = await model.sendRequest(messages, {}, token);
        for await (const fragment of chatResponse.text) {
          stream.markdown(fragment);
        }
        stream.button({
          command: COMMAND_NAME.createByContentType,
          title: 'Create new content',
        });
      } catch (err) {
        this.showAiError(stream);
        return;
      }
    } else {
      stream.markdown('Sorry, I do not understand that command. Check out the [Front Matter CMS](https://frontmatter.codes/docs) documentation for more information.')
    }
  }

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

    const dashboardFile = 'dashboardWebView.js';
    const localPort = `9000`;
    const localServerUrl = `localhost:${localPort}`;

    const nonce = WebviewHelper.getNonce();

    const ext = Extension.getInstance();
    const isProd = ext.isProductionMode;
    const version = ext.getVersion();
    const isBeta = ext.isBetaVersion();
    const extensionUri = ext.extensionPath;

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

    let scriptUri = '';
    if (isProd) {
      scriptUri = webView.webview
        .asWebviewUri(Uri.joinPath(extensionUri, 'dist', dashboardFile))
        .toString();
    } else {
      scriptUri = `http://${localServerUrl}/${dashboardFile}`;
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

          <script ${isProd ? `nonce="${nonce}"` : ''} src="${scriptUri}"></script>
        </body>
      </html>
    `;

    Telemetry.send(TelemetryEvent.openChatbot);
  }

  private static async initChat() {
    const response = await fetch(`${WEBSITE_LINKS.root}/api/ai-init`);

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    if (!data.company || !data.chatId) {
      return;
    }

    this.company = data.company;
    this.chatId = data.chatId;
  }

  private static async retrieveDocs(prompt: string) {
    if (!this.company || !this.chatId) {
      return;
    }

    const response = await fetch(`${WEBSITE_LINKS.root}/api/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*',
      },
      body: JSON.stringify({
        company: this.company,
        chatId: this.chatId,
        question: prompt,
      }),
    });

    if (!response.ok) {
      return;
    }

    return await response.json();
  }

  private static showAiError(stream: ChatResponseStream) {
    stream.markdown(`Sorry, I am not able to connect to the Front Matter AI service. Please try again later or check out the [Front Matter CMS](https://frontmatter.codes/docs) documentation.`);
  }
}
