import { Dashboard } from '../../commands/Dashboard';
import { DashboardCommand } from '../../dashboardWebView/DashboardCommand';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { Logger } from '../../helpers/Logger';
import { PostMessageData } from '../../models';

export abstract class BaseListener {
  public static process(msg: PostMessageData) {}

  /**
   * Send a message to the webview
   * @param command
   * @param data
   */
  public static sendMsg(command: DashboardCommand, payload: any) {
    Logger.info(`Sending message to webview: ${command}`);

    Dashboard.postWebviewMessage({
      command,
      payload
    });
  }
}
