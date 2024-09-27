import { Dashboard } from '../../commands/Dashboard';
import { DashboardCommand } from '../../dashboardWebView/DashboardCommand';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { Logger } from '../../helpers/Logger';
import { PostMessageData } from '../../models';

export abstract class BaseListener {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public static process(msg: PostMessageData) {}

  /**
   * Send a message to the webview
   * @param command
   * @param data
   */
  public static sendMsg(command: DashboardCommand, payload: any) {
    if (command === DashboardCommand.loading) {
      const loadingType = payload ? `- ${JSON.stringify(payload)}` : '- Turn off';
      Logger.verbose(`Sending message to dashboard: ${command} ${loadingType}`);
    } else {
      Logger.verbose(`Sending message to dashboard: ${command}`);
    }

    Dashboard.postWebviewMessage({
      command,
      payload
    });
  }

  public static sendRequest(
    command: DashboardCommand | DashboardMessage,
    requestId: string,
    payload: any
  ) {
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
