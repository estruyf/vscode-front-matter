import { commands, env } from "vscode";
import { SettingsListener } from ".";
import { COMMAND_NAME } from "../constants";
import { DashboardMessage } from "../dashboardWebView/DashboardMessage";
import { openFileInEditor } from "../helpers/openFileInEditor";
import { BaseListener } from "./BaseListener";


export class ExtensionListener extends BaseListener {

  public static process(msg: { command: DashboardMessage, data: any }) {
    super.process(msg);

    switch(msg.command) {
      case DashboardMessage.openFile:
        openFileInEditor(msg.data);
        break;
      case DashboardMessage.initializeProject:
        commands.executeCommand(COMMAND_NAME.init, SettingsListener.getSettings);
        break;
      case DashboardMessage.copyToClipboard:
        env.clipboard.writeText(msg.data);
        break;
    }
  }
}