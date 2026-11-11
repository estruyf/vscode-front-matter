import { MediaHelpers } from '../../helpers/MediaHelpers';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { BaseListener } from './BaseListener';
import { DashboardCommand } from '../../dashboardWebView/DashboardCommand';
import { SortingOption } from '../../dashboardWebView/models';
import { commands, env, ProgressLocation, Uri, window, workspace } from 'vscode';
import { COMMAND_NAME } from '../../constants';
import * as os from 'os';
import { Folders } from '../../commands';
import { MediaInfo, PostMessageData, UnmappedMedia } from '../../models';
import { decodeBase64, FilesHelper, MediaLibrary } from '../../helpers';
import { Dashboard } from '../../commands/Dashboard';
import { lookup } from 'mime-types';
import imageSize from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { existsAsync, flattenObjectKeys } from '../../utils';
import { join, parse } from 'path';
import { LocalizationKey, localize } from '../../localization';

export class MediaListener extends BaseListener {
  private static timers: { [folder: string]: any } = {};

  public static async process(msg: PostMessageData) {
    super.process(msg);

    const { page, folder, sorting } = msg.payload ?? {};

    switch (msg.command) {
      case DashboardMessage.getMedia:
        this.sendMediaFiles(page, folder, sorting);
        break;
      case DashboardMessage.refreshMedia:
        MediaHelpers.resetMedia();
        this.sendMediaFiles(0, msg?.payload?.folder);
        break;
      case DashboardMessage.uploadMedia:
        this.store(msg?.payload);
        break;
      case DashboardMessage.uploadPastedMedia:
        await this.storePastedMedia(msg);
        break;
      case DashboardMessage.deleteMedia:
        await this.delete(msg?.payload);
        break;
      case DashboardMessage.revealMedia:
        this.openFileInFinder(msg?.payload?.file);
        break;
      case DashboardMessage.insertMedia:
        MediaHelpers.insertMediaToMarkdown(msg?.payload);
        break;
      case DashboardMessage.insertFile:
        MediaHelpers.insertMediaToMarkdown(msg?.payload);
        break;
      case DashboardMessage.updateMediaMetadata:
        this.update(msg.payload);
        break;
      case DashboardMessage.getUnmappedMedia:
        this.getUnmappedMedia(msg);
        break;
      case DashboardMessage.remapMediaMetadata:
        this.remapMediaMetadata(msg);
        break;
      case DashboardMessage.createMediaFolder:
        await commands.executeCommand(COMMAND_NAME.createFolder, msg?.payload);
        break;
      case DashboardMessage.updateMediaFolder:
        await this.updateMediaFolder(msg.payload);
        break;
      case DashboardMessage.deleteMediaFolder:
        await this.deleteMediaFolder(msg.payload);
        break;
      case DashboardMessage.createHexoAssetFolder:
        if (msg?.payload.hexoAssetFolderPath) {
          Folders.createFolder(msg?.payload.hexoAssetFolderPath);
        }
        break;
    }
  }

  public static async deleteMediaFolder(msg: { folder: string }) {
    if (!msg?.folder) {
      return;
    }

    window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: localize(
          LocalizationKey.listenersDashboardMediaListenersDeleteMediaFolderProgressTitle
        ),
        cancellable: false
      },
      async () => {
        const folderPath = parse(msg.folder).dir;

        const mediaLib = MediaLibrary.getInstance();
        const parsedPath = MediaLibrary.parsePath(msg.folder);
        const mediaFiles = await mediaLib.getAllByPath(parsedPath);

        for (const fileName of Object.keys(mediaFiles)) {
          const filePath = join(msg.folder, fileName);
          await mediaLib.remove(filePath);
        }

        await workspace.fs.delete(Uri.file(msg.folder), { recursive: true, useTrash: false });
        await MediaListener.sendMediaFiles(0, folderPath);
      }
    );
  }

  public static async updateMediaFolder(msg: {
    folder: string;
    wsFolder?: string;
    staticFolder?: string;
  }) {
    if (!msg?.folder) {
      return;
    }

    window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: localize(
          LocalizationKey.listenersDashboardMediaListenersUpdateMediaFolderProgressTitle
        ),
        cancellable: false
      },
      async () => {
        const folderName = parse(msg.folder).base;

        const newFolderName = await window.showInputBox({
          prompt: 'Enter new folder name',
          value: folderName
        });

        if (!newFolderName || newFolderName === folderName) {
          return;
        }

        const newFolderPath = join(parse(msg.folder).dir, newFolderName);

        // Get all media files from the folder
        const mediaLib = MediaLibrary.getInstance();
        const parsedPath = MediaLibrary.parsePath(msg.folder);
        const mediaFiles = await mediaLib.getAllByPath(parsedPath);

        // Update the folder
        await workspace.fs.rename(Uri.file(msg.folder), Uri.file(newFolderPath), {
          overwrite: false
        });

        // Update the media files
        for (const fileName of Object.keys(mediaFiles)) {
          const newFilePath = join(newFolderPath, fileName);
          const oldFilePath = join(msg.folder, fileName);
          await mediaLib.rename(oldFilePath, newFilePath);
        }

        await this.sendMediaFiles(0, parse(msg.folder).dir);
      }
    );
  }

  /**
   * Sends the media files to the dashboard
   * @param page
   * @param folder
   * @param sorting
   */
  public static async sendMediaFiles(page = 0, folder = '', sorting: SortingOption | null = null) {
    await MediaLibrary.reset();
    const files = await MediaHelpers.getMedia(page, folder, sorting);
    this.sendMsg(DashboardCommand.media, files);
  }

  /**
   * Open file in finder or explorer
   * @param file
   */
  private static openFileInFinder(file: string) {
    if (file) {
      if (os.type() === 'Linux' && env.remoteName?.toLowerCase() === 'wsl') {
        commands.executeCommand('remote-wsl.revealInExplorer', Uri.file(file));
      } else {
        commands.executeCommand('revealFileInOS', Uri.file(file));
      }
    }
  }

  private static async remapMediaMetadata({ command, payload }: PostMessageData) {
    if (!payload || !command) {
      return;
    }

    const { unmappedItem, file, folder, page } = payload;

    if (!unmappedItem || !(unmappedItem as UnmappedMedia).absPath || !file) {
      return;
    }

    const mediaLib = MediaLibrary.getInstance();

    await mediaLib.rename((unmappedItem as UnmappedMedia).absPath, file);
    this.sendMediaFiles(page || 0, folder || '');
  }

  /**
   * Find all the unmapped media file with the given name
   * @param msg
   */
  private static async getUnmappedMedia({ command, payload, requestId }: PostMessageData) {
    if (!payload || !command || !requestId) {
      return;
    }

    try {
      const mediaLib = MediaLibrary.getInstance();
      const allMetadata = await mediaLib.getAll();
      const allFilePaths = flattenObjectKeys(allMetadata);

      const filesEndingWith = allFilePaths.filter((f) => f.endsWith(payload));

      // Check if the files exist
      const unmappedFiles: UnmappedMedia[] = [];
      for (const file of filesEndingWith) {
        const absPath = FilesHelper.relToAbsPath(file);
        if (!(await existsAsync(absPath))) {
          const parsedPath = MediaLibrary.parsePath(absPath);
          const metadata = await mediaLib.get(parsedPath);
          if (metadata) {
            unmappedFiles.push({
              file,
              absPath,
              metadata: {
                ...(metadata as { [key: string]: any })
              }
            } as UnmappedMedia);
          }
        }
      }

      // Always reply, the dashboard waits for the response
      this.sendRequest(command as DashboardCommand, requestId, unmappedFiles);
    } catch (e) {
      this.sendError(command as DashboardCommand, requestId, (e as Error)?.message || e);
    }
  }

  /**
   * Store the file and send a message after multiple uploads
   * @param data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    } catch {
      // Do nothing
    }
  }

  /**
   * Store a pasted media file in the selected folder and report the stored file
   * back to the dashboard so it can collect the metadata and insert it.
   * @param msg
   */
  private static async storePastedMedia({ command, payload, requestId }: PostMessageData) {
    if (!command || !requestId) {
      return;
    }

    const { fileName, contents, folder } = payload ?? {};
    if (!fileName || !contents || !folder) {
      this.sendError(command as DashboardCommand, requestId, 'Missing paste information');
      return;
    }

    const data = decodeBase64(contents);
    if (!data) {
      this.sendError(command as DashboardCommand, requestId, 'Invalid media contents');
      return;
    }

    let fsPath: string | undefined;
    try {
      fsPath = await MediaHelpers.saveMediaBuffer(fileName, data.data, folder);
    } catch (e) {
      fsPath = undefined;
    }

    if (!fsPath) {
      this.sendError(command as DashboardCommand, requestId, 'Could not store the media');
      return;
    }

    const mimeType = lookup(fsPath) || undefined;

    let dimensions: ISizeCalculationResult | undefined;
    try {
      dimensions = mimeType?.startsWith('image/') ? imageSize(fsPath) : undefined;
    } catch {
      dimensions = undefined;
    }

    MediaHelpers.resetMedia();
    this.sendRequest(command as DashboardCommand, requestId, {
      filename: parse(fsPath).base,
      fsPath,
      vsPath: Dashboard.getWebview()?.asWebviewUri(Uri.file(fsPath))?.toString(),
      dimensions,
      mimeType,
      metadata: {}
    } as MediaInfo);

    this.sendMediaFiles(0, folder);
  }

  /**
   * Delete a media file
   * @param data
   */
  private static async delete(data: { file: string; page: number; folder: string | null }) {
    try {
      await MediaHelpers.deleteFile(data.file);
      await this.sendMediaFiles(data.page || 0, data.folder || '');
    } catch {
      // Do nothing
    }
  }

  /**
   * Update media metadata
   * @param data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static async update(data: any) {
    try {
      const { page, folder } = data;

      await MediaHelpers.updateMetadata(data);

      this.sendMediaFiles(page || 0, folder || '');
    } catch {
      // Do nothing
    }
  }
}
