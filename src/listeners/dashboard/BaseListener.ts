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
    Logger.info(`Sending message to dashboard: ${command}`);

    Dashboard.postWebviewMessage({
      command,
      payload
    });
  }

  public static sendRequest(command: DashboardCommand, requestId: string, payload: any) {
    Dashboard.postWebviewMessage({
      command,
      requestId,
      payload
    });
  }

  public static sendError(command: DashboardCommand, requestId: string, error: any) {
    Dashboard.postWebviewMessage({
      command,
      requestId,
      error
    });
  }
}
