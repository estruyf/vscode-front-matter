import { commands } from "vscode";
import { Dashboard } from "../../commands/Dashboard";
import { COMMAND_NAME } from "../../constants";
import { DashboardData } from "../../models";
import { Command } from "../../panelWebView/Command";
import { CommandToCode } from "../../panelWebView/CommandToCode";
import { BaseListener } from "./BaseListener";


export class MediaListener extends BaseListener {

  /**
   * Process the messages for the dashboard views
   * @param msg 
   */
  public static process(msg: { command: any, data: any }) {
    super.process(msg);

    switch(msg.command) {
      case CommandToCode.selectImage:
        this.selectMedia(msg);
        break;
    }
  }

  /**
   * Select a media file
   */
  private static async selectMedia(msg: { data: any }) {
    await commands.executeCommand(COMMAND_NAME.dashboard, {
      type: "media",
      data: msg.data
    } as DashboardData);
    this.getMediaSelection();
  }

  /**
   * Return the media selection
   */
  public static async getMediaSelection() {
    this.sendMsg(Command.mediaSelectionData, Dashboard.viewData);
  }
}