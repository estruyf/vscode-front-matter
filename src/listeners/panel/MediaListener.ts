import { PanelProvider } from './../../panelWebView/PanelProvider';
import { commands, window } from 'vscode';
import { Dashboard } from '../../commands/Dashboard';
import { COMMAND_NAME } from '../../constants';
import { ImageHelper } from '../../helpers';
import { DashboardData, PostMessageData } from '../../models';
import { Command } from '../../panelWebView/Command';
import { CommandToCode } from '../../panelWebView/CommandToCode';
import { BaseListener } from './BaseListener';
import { Preview } from '../../commands';

export class MediaListener extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case CommandToCode.selectImage:
        this.selectMedia(msg);
        break;
      case CommandToCode.selectFile:
        this.selectMedia(msg);
        break;
      case CommandToCode.getImageUrl:
        this.generateUrl(msg.payload);
        break;
      case CommandToCode.processMediaData:
        this.processMedia(msg.command, msg.payload, msg.requestId);
        break;
    }
  }

  private static processMedia(command: string, payload: any, requestId?: string) {
    if (!requestId || !payload) {
      return;
    }

    const panel = PanelProvider.getInstance();

    if (typeof payload === 'string') {
      const imagePath = payload;
      const filePath = window.activeTextEditor?.document.uri.fsPath || Preview.filePath;
      if (!filePath) {
        return;
      }

      const imageAbsPath = imagePath.startsWith('http')
        ? imagePath
        : ImageHelper.relToAbs(filePath, imagePath);

      let preview = undefined;
      if (imageAbsPath) {
        preview =
          typeof imageAbsPath === 'string'
            ? imageAbsPath
            : panel.getWebview()?.asWebviewUri(imageAbsPath);
      }

      const imageData = {
        original: imagePath,
        absPath: imageAbsPath,
        webviewUrl: preview ? preview.toString() : null
      };

      this.sendRequest(command, requestId, imageData);
      return;
    }
  }

  private static generateUrl(
    data: string | { original: string; absPath: string; webviewUrl: string }
  ) {
    const filePath = window.activeTextEditor?.document.uri.fsPath;

    if (typeof data === 'string') {
      const imgUrl = ImageHelper.relToAbs(filePath || '', data);
      if (imgUrl) {
        const viewUrl = PanelProvider.getInstance().getWebview()?.asWebviewUri(imgUrl);
        if (viewUrl) {
          this.sendMsg(Command.sendMediaUrl, {
            original: data,
            url: viewUrl.toString()
          });
        }
      }
    }
  }

  /**
   * Select a media file
   */
  private static async selectMedia(msg: PostMessageData) {
    await commands.executeCommand(COMMAND_NAME.dashboard, {
      type: 'media',
      data: msg.payload
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
