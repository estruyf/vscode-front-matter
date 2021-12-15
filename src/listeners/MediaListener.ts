import { MediaHelpers } from './../helpers/MediaHelpers';
import { DashboardMessage } from "../dashboardWebView/DashboardMessage";
import { BaseListener } from "./BaseListener";
import { DashboardCommand } from '../dashboardWebView/DashboardCommand';
import { SortingOption } from '../dashboardWebView/models';


export class MediaListener extends BaseListener {
  private static timers: { [folder: string]: any } = {};

  public static async process(msg: { command: DashboardMessage, data: any }) {
    super.process(msg);

    switch(msg.command) {
      case DashboardMessage.getMedia:
        const { page, folder, sorting } = msg?.data;
        this.sendMediaFiles(page, folder, sorting);
        break;
      case DashboardMessage.refreshMedia:
        MediaHelpers.resetMedia();
        this.sendMediaFiles(0, msg?.data?.folder);
        break;
      case DashboardMessage.uploadMedia:
        this.store(msg?.data);
        break;
      case DashboardMessage.deleteMedia:
        this.delete(msg?.data);
        break;
      case DashboardMessage.insertPreviewImage:
        
    }
  }

  /**
   * Sends the media files to the dashboard
   * @param page 
   * @param folder 
   * @param sorting 
   */
  private static async sendMediaFiles(page: number = 0, folder: string = '', sorting: SortingOption | null = null) {
    const files = await MediaHelpers.getMedia(page, folder, sorting);
    this.sendMsg(DashboardCommand.media, files);
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
        this.sendMediaFiles(0, folder || "");
        delete this.timers[folderPath];
      }, 500);
    } catch {}
  }

  /**
   * Delete a media file
   * @param data 
   */
  private static delete(data: { file: string; page: number; folder: string | null; }) {
    try {
      MediaHelpers.deleteFile(data);
      this.sendMediaFiles(data.page || 0, data.folder || "");
    } catch {}
  }
}