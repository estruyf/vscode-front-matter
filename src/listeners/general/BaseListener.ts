import { GeneralCommands } from './../../constants';
import { Dashboard } from "../../commands/Dashboard";
import { DashboardMessage } from "../../dashboardWebView/DashboardMessage";
import { ExplorerView } from "../../explorerView/ExplorerView";
import { Extension } from "../../helpers";
import { Logger } from "../../helpers/Logger";


export abstract class BaseListener {

  public static process(msg: { command: DashboardMessage, data: any }) {}
  
  /**
   * Send a message to the webview
   * @param command 
   * @param data 
   */
  public static sendMsg(command: GeneralCommands, data: any) {
    Logger.info(`Sending message to webview (panel&dashboard): ${command}`);

    const extPath = Extension.getInstance().extensionPath;
    const panel = ExplorerView.getInstance(extPath);

    panel.sendMessage({ command: command as any, data });

    Dashboard.postWebviewMessage({ command: command as any, data });
  }
}