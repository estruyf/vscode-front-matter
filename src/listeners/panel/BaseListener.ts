import { Extension } from './../../helpers/Extension';
import { ExplorerView } from './../../explorerView/ExplorerView';
import { Logger } from '../../helpers';
import { Command } from '../../panelWebView/Command';
import { PostMessageData } from '../../models';

export abstract class BaseListener {
  public static process(msg: PostMessageData) {}

  /**
   * Send a message to the webview
   * @param command
   * @param data
   */
  public static sendMsg(command: Command, payload: any) {
    Logger.info(`Sending message to panel: ${command}`);

    const extPath = Extension.getInstance().extensionPath;
    const panel = ExplorerView.getInstance(extPath);

    panel.sendMessage({
      command,
      payload
    });
  }

  public static sendRequest(command: string, requestId: string, payload: any) {
    Logger.info(`Sending request result to panel: ${command}`);

    const extPath = Extension.getInstance().extensionPath;
    const panel = ExplorerView.getInstance(extPath);

    panel.getWebview()?.postMessage({
      command,
      requestId,
      payload
    });
  }

  public static sendRequestError(command: string, requestId: string, error: any) {
    Logger.info(`Sending request error to the panel: ${command}`);

    const extPath = Extension.getInstance().extensionPath;
    const panel = ExplorerView.getInstance(extPath);

    panel.getWebview()?.postMessage({
      command,
      requestId,
      error
    });
  }
}
