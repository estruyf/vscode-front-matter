import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { Telemetry } from '../../helpers/Telemetry';
import { PostMessageData } from '../../models';
import { BaseListener } from './BaseListener';

export class TelemetryListener extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case DashboardMessage.sendTelemetry:
        Telemetry.send(msg.payload.event, msg.payload.properties, msg.payload.metrics);
        break;
    }
  }
}
