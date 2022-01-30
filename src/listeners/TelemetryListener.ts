import { DashboardMessage } from "../dashboardWebView/DashboardMessage";
import { Telemetry } from "../helpers/Telemetry";
import { BaseListener } from "./BaseListener";


export class TelemetryListener extends BaseListener {

  /**
   * Process the messages for the dashboard views
   * @param msg 
   */
  public static process(msg: { command: DashboardMessage, data: any }) {
    super.process(msg);

    switch(msg.command) {
      case DashboardMessage.sendTelemetry:
        Telemetry.send(msg.data.event, msg.data.properties, msg.data.metrics);
        break;
    }
  }
}