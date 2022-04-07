import { Dashboard } from "../../commands/Dashboard";
import { ExtensionState } from "../../constants";
import { DashboardCommand } from "../../dashboardWebView/DashboardCommand";
import { DashboardMessage } from "../../dashboardWebView/DashboardMessage";
import { Extension, Notifications } from "../../helpers";
import { BaseListener } from "./BaseListener";


export class DashboardListener extends BaseListener {

  /**
   * Process the messages for the dashboard views
   * @param msg 
   */
  public static process(msg: { command: DashboardMessage, data: any }) {
    super.process(msg);

    switch(msg.command) {
      case DashboardMessage.getViewType:
        if (Dashboard.viewData) {
          this.sendMsg(DashboardCommand.viewData, Dashboard.viewData);
        }
        break;
      case DashboardMessage.reload:
        Dashboard.reload();
        break;
      case DashboardMessage.setPageViewType:
        Extension.getInstance().setState(ExtensionState.PagesView, msg.data, "workspace");
        break;
      case DashboardMessage.showWarning:
        Notifications.warning(msg.data);
        break;
    }
  }
}