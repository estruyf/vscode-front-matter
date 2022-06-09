import { Notifications } from './Notifications';
import { Uri, workspace } from 'vscode';
import { Folders } from '../commands/Folders';
import { isValidFile } from './isValidFile';

export class FilesHelper {

  /**
   * Retrieve all markdown files from the current project
   */
  public static async getAllFiles(): Promise<Uri[] | null> {
    const folderInfo = await Folders.getInfo();
    const pages: Uri[] = [];

    if (folderInfo) {
      for (const folder of folderInfo) {
        for (const file of folder.lastModified) {
          if (isValidFile(file.fileName)) {
            pages.push(Uri.file(file.filePath));
          }
        }
      }
    }

    if (pages.length === 0) {
      Notifications.warning(`No files found.`);
      return null;
    }

    return pages;
  }
}