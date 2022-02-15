import { ExplorerView } from './../../explorerView/ExplorerView';
import { commands, window } from "vscode";
import { Dashboard } from "../../commands/Dashboard";
import { COMMAND_NAME } from "../../constants";
import { ImageHelper } from "../../helpers";
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
      case CommandToCode.getImageUrl:
        this.generateUrl(msg.data);
        break;
    }
  }

  private static generateUrl(data: string) {
    const filePath = window.activeTextEditor?.document.uri.fsPath;

    const imgUrl = ImageHelper.relToAbs(filePath || "", data);
    if (imgUrl) {
      const viewUrl = ExplorerView.getInstance().getWebview()?.asWebviewUri(imgUrl);
      if (viewUrl) {
        this.sendMsg(Command.sendMediaUrl, {
          original: data,
          url: viewUrl.toString()
        });
      }
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