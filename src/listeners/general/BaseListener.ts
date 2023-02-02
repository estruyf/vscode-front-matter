import { GeneralCommands } from './../../constants/GeneralCommands';
import { Dashboard } from '../../commands/Dashboard';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { ExplorerView } from '../../explorerView/ExplorerView';
import { Extension } from '../../helpers';
import { Logger } from '../../helpers/Logger';
import { CommandToCode } from '../../panelWebView/CommandToCode';
import { commands, Uri } from 'vscode';

export abstract class BaseListener {
  public static process(msg: { command: DashboardMessage | CommandToCode | string; data: any }) {
    switch (msg.command) {
      case GeneralCommands.toVSCode.openLink:
        if (msg.data) {
          commands.executeCommand('vscode.open', Uri.parse(msg.data));
        }
        break;
    }
  }

  /**
   * Send a message to the webview
   * @param command
   * @param data
   */
  public static sendMsg(command: string, data: any) {
    Logger.info(`Sending message to webview (panel&dashboard): ${command}`);

    const extPath = Extension.getInstance().extensionPath;
    const panel = ExplorerView.getInstance(extPath);

    panel.sendMessage({ command: command as any, data });

    Dashboard.postWebviewMessage({ command: command as any, data });
  }
}
