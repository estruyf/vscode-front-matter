import { Dashboard } from "../commands/Dashboard";
import { DashboardCommand } from "../dashboardWebView/DashboardCommand";
import { DashboardMessage } from "../dashboardWebView/DashboardMessage";
import { Logger } from "../helpers/Logger";


export abstract class BaseListener {

  public static process(msg: { command: DashboardMessage, data: any }) {
    Logger.info(`Receiving message from webview: ${msg.command}`);
  }
  
  /**
   * Send a message to the webview
   * @param command 
   * @param data 
   */
  public static sendMsg(command: DashboardCommand, data: any) {
    Logger.info(`Sending message to webview: ${command}`);

    Dashboard.postWebviewMessage({
      command,
      data
    });
  }
}