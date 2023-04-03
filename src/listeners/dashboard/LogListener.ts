import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { Logger } from '../../helpers';
import { PostMessageData } from '../../models';
import { BaseListener } from './BaseListener';

export class LogListener extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case DashboardMessage.logError:
        Logger.error(msg.payload);
        break;
    }
  }
}
