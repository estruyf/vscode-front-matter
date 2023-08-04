import { GeneralCommands } from './../../constants/GeneralCommands';
import { Dashboard } from '../../commands/Dashboard';
import { PanelWebview } from '../../PanelWebview/PanelWebview';
import { Extension } from '../../helpers';
import { Logger } from '../../helpers/Logger';
import { commands, Uri } from 'vscode';
import { PostMessageData } from '../../models';

export abstract class BaseListener {
  public static process(msg: PostMessageData) {
    switch (msg.command) {
      case GeneralCommands.toVSCode.openLink:
        if (msg.payload) {
          commands.executeCommand('vscode.open', Uri.parse(msg.payload));
        }
        break;
    }
  }

  /**
   * Send a message to the webview
   * @param command
   * @param data
   */
  public static sendMsg(command: string, payload: any) {
    Logger.info(`Sending message to webview (panel&dashboard): ${command}`);

    const extPath = Extension.getInstance().extensionPath;
    const panel = PanelWebview.getInstance(extPath);

    panel.sendMessage({ command: command as any, payload });

    Dashboard.postWebviewMessage({ command: command as any, payload });
  }
}
