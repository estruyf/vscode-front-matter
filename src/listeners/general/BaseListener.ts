import { GeneralCommands } from './../../constants/GeneralCommands';
import { Dashboard } from '../../commands/Dashboard';
import { PanelProvider } from '../../panelWebView/PanelProvider';
import { ArticleHelper, Extension } from '../../helpers';
import { Logger } from '../../helpers/Logger';
import { commands, Uri, window } from 'vscode';
import { PostMessageData } from '../../models';
import { Preview } from '../../commands';
import { joinUrl } from '../../utils';

export abstract class BaseListener {
  public static process(msg: PostMessageData) {
    switch (msg.command) {
      case GeneralCommands.toVSCode.openLink:
        if (msg.payload) {
          commands.executeCommand('vscode.open', Uri.parse(msg.payload));
        }
        break;
      case GeneralCommands.toVSCode.openOnWebsite:
        this.openOnWebsite(msg.payload);
        break;
      case GeneralCommands.toVSCode.runCommand:
        if (msg.payload) {
          const { command, args } = msg.payload;
          commands.executeCommand(command, args);
        }
        break;
      case GeneralCommands.toVSCode.logging.verbose:
        Logger.verbose(msg.payload.message, msg.payload.location);
        break;
      case GeneralCommands.toVSCode.logging.info:
        Logger.info(msg.payload.message, msg.payload.location);
        break;
      case GeneralCommands.toVSCode.logging.warn:
        Logger.warning(msg.payload.message, msg.payload.location);
        break;
      case GeneralCommands.toVSCode.logging.error:
        Logger.error(msg.payload.message, msg.payload.location);
        break;
    }
  }

  /**
   * Send a message to the webview
   * @param command
   * @param data
   */
  public static sendMsg(command: string, payload: any) {
    Logger.verbose(`Sending message to webview (panel&dashboard): ${command}`);

    const extPath = Extension.getInstance().extensionPath;
    const panel = PanelProvider.getInstance(extPath);

    panel.sendMessage({ command: command as any, payload });

    Dashboard.postWebviewMessage({ command: command as any, payload });
  }

  /**
   * Open the page on the website
   * @param param0
   * @returns
   */
  private static async openOnWebsite({
    websiteUrl,
    filePath
  }: {
    websiteUrl: string;
    filePath?: string;
  }) {
    if (websiteUrl) {
      const article = filePath
        ? await ArticleHelper.getFrontMatterByPath(filePath)
        : ArticleHelper.getCurrent();
      if (article) {
        if (!filePath) {
          const editor = window.activeTextEditor;
          if (!editor) {
            return;
          }

          filePath = editor.document.uri.fsPath;
        }

        const slug = await Preview.getContentSlug(article, filePath);

        const fullUrl = joinUrl(websiteUrl, slug);
        commands.executeCommand('vscode.open', fullUrl);
      }
    }
  }
}
