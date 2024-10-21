import { Notifications } from './Notifications';
import { Uri } from 'vscode';
import { Folders, WORKSPACE_PLACEHOLDER } from '../commands/Folders';
import { isValidFile } from './isValidFile';
import { parseWinPath } from './parseWinPath';
import { join } from 'path';

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

  /**
   * Relative path to absolute path
   * @param filePath
   * @returns
   */
  public static relToAbsPath(filePath: string): string {
    const wsFolder = Folders.getWorkspaceFolder();
    const absPath = join(parseWinPath(wsFolder?.fsPath || ''), filePath);
    return parseWinPath(absPath);
  }

  /**
   * Absolute path to rel path
   * @param filePath
   * @returns
   */
  public static absToRelPath(filePath: string): string {
    const wsFolder = Folders.getWorkspaceFolder();
    const relPath = filePath.replace(wsFolder?.fsPath || '', WORKSPACE_PLACEHOLDER);
    return parseWinPath(relPath);
  }
}
