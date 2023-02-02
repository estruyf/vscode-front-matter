import { Telemetry } from '../../helpers/Telemetry';
import { MediaHelpers } from '../../helpers/MediaHelpers';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { BaseListener } from './BaseListener';
import { DashboardCommand } from '../../dashboardWebView/DashboardCommand';
import { SortingOption } from '../../dashboardWebView/models';
import { commands, env, Uri } from 'vscode';
import { COMMAND_NAME, TelemetryEvent } from '../../constants';
import * as os from 'os';
import { Folders } from '../../commands';

export class MediaListener extends BaseListener {
  private static timers: { [folder: string]: any } = {};

  public static async process(msg: { command: DashboardMessage; data: any }) {
    super.process(msg);

    switch (msg.command) {
      case DashboardMessage.getMedia:
        const { page, folder, sorting } = msg?.data;
        this.sendMediaFiles(page, folder, sorting);
        break;
      case DashboardMessage.refreshMedia:
        Telemetry.send(TelemetryEvent.refreshMedia);
        MediaHelpers.resetMedia();
        this.sendMediaFiles(0, msg?.data?.folder);
        break;
      case DashboardMessage.uploadMedia:
        Telemetry.send(TelemetryEvent.uploadMedia);
        this.store(msg?.data);
        break;
      case DashboardMessage.deleteMedia:
        Telemetry.send(TelemetryEvent.deleteMedia);
        this.delete(msg?.data);
        break;
      case DashboardMessage.revealMedia:
        this.openFileInFinder(msg?.data?.file);
        break;
      case DashboardMessage.insertMedia:
        Telemetry.send(TelemetryEvent.insertMediaToContent);
        MediaHelpers.insertMediaToMarkdown(msg?.data);
        break;
      case DashboardMessage.insertFile:
        Telemetry.send(TelemetryEvent.insertFileToContent);
        MediaHelpers.insertMediaToMarkdown(msg?.data);
        break;
      case DashboardMessage.updateMediaMetadata:
        Telemetry.send(TelemetryEvent.updateMediaMetadata);
        this.update(msg.data);
        break;
      case DashboardMessage.createMediaFolder:
        await commands.executeCommand(COMMAND_NAME.createFolder, msg?.data);
        break;
      case DashboardMessage.createHexoAssetFolder:
        if (msg?.data.hexoAssetFolderPath) {
          Folders.createFolder(msg?.data.hexoAssetFolderPath);
        }
        break;
    }
  }

  /**
   * Sends the media files to the dashboard
   * @param page
   * @param folder
   * @param sorting
   */
  public static async sendMediaFiles(
    page: number = 0,
    folder: string = '',
    sorting: SortingOption | null = null
  ) {
    const files = await MediaHelpers.getMedia(page, folder, sorting);
    this.sendMsg(DashboardCommand.media, files);
  }

  private static openFileInFinder(file: string) {
    if (file) {
      if (os.type() === 'Linux' && env.remoteName?.toLowerCase() === 'wsl') {
        commands.executeCommand('remote-wsl.revealInExplorer', Uri.parse(file));
      } else {
        commands.executeCommand('revealFileInOS', Uri.parse(file));
      }
    }
  }

  /**
   * Store the file and send a message after multiple uploads
   * @param data
   */
  private static async store(data: any) {
    try {
      const { folder } = data;
      await MediaHelpers.saveFile(data);

      const folderPath = `${folder}`;
      if (this.timers[folderPath]) {
        clearTimeout(this.timers[folderPath]);
        delete this.timers[folderPath];
      }

      this.timers[folderPath] = setTimeout(() => {
        MediaHelpers.resetMedia();
        this.sendMediaFiles(0, folder || '');
        delete this.timers[folderPath];
      }, 500);
    } catch {}
  }

  /**
   * Delete a media file
   * @param data
   */
  private static delete(data: { file: string; page: number; folder: string | null }) {
    try {
      MediaHelpers.deleteFile(data);
      this.sendMediaFiles(data.page || 0, data.folder || '');
    } catch {}
  }

  /**
   * Update media metadata
   * @param data
   */
  private static async update(data: any) {
    try {
      const { page, folder } = data;

      await MediaHelpers.updateMetadata(data);

      this.sendMediaFiles(page || 0, folder || '');
    } catch {}
  }
}
