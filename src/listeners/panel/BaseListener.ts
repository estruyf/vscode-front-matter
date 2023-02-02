import { Extension } from './../../helpers/Extension';
import { ExplorerView } from './../../explorerView/ExplorerView';
import { Logger } from '../../helpers';
import { CommandToCode } from '../../panelWebView/CommandToCode';
import { Command } from '../../panelWebView/Command';

export abstract class BaseListener {
  public static process(msg: { command: CommandToCode; data: any }) {}

  /**
   * Send a message to the webview
   * @param command
   * @param data
   */
  public static sendMsg(command: Command, data: any) {
    Logger.info(`Sending message to panel: ${command}`);

    const extPath = Extension.getInstance().extensionPath;
    const panel = ExplorerView.getInstance(extPath);

    panel.sendMessage({
      command,
      data
    });
  }
}
