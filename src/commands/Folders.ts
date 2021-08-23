import { commands, Uri, workspace, window } from "vscode";
import { CONFIG_KEY, SETTINGS_CONTENT_FOLDERS } from "../constants";
import { basename, join } from "path";
import { ContentFolder, FileInfo, FolderInfo } from "../models";
import uniqBy = require("lodash.uniqby");
import { Template } from "./Template";
import { Notifications } from "../helpers/Notifications";
import { CONTEXT } from "../constants/context";
import { SettingsHelper } from "../helpers";

export class Folders {

  /**
   * Create content in a registered folder
   * @returns 
   */
  public static async create() {
    const folders = Folders.get();

    if (!folders || folders.length === 0) {
      Notifications.warning(`There are no known content locations defined in this project.`);
      return;
    }

    const selectedFolder = await window.showQuickPick(folders.map(f => f.title), {
      placeHolder: `Select where you want to create your content`
    });

    if (!selectedFolder) {
      Notifications.warning(`You didn't select a place where you wanted to create your content.`);
      return;
    }

    const location = folders.find(f => f.title === selectedFolder);
    if (location) {
      const folderPath = Folders.getFolderPath(Uri.file(location.fsPath));
      if (folderPath) {
        Template.create(folderPath);
      }
    }
  }

  /**
   * Register the new folder path
   * @param folder 
   */
  public static async register(folder: Uri) {
    if (folder && folder.fsPath) {
      const wslPath = folder.fsPath.replace(/\//g, '\\');

      let folders = Folders.get();

      const exists = folders.find(f => f.paths.includes(folder.fsPath) || f.paths.includes(wslPath));

      if (exists) {
        Notifications.warning(`Folder is already registered`);
        return;
      }

      const folderName = await window.showInputBox({  
        prompt: `Which name would you like to specify for this folder?`,
        placeHolder: `Folder name`,
        value: basename(folder.fsPath)
      });

      folders.push({
        title: folderName,
        fsPath: folder.fsPath,
        paths: folder.fsPath === wslPath ? [folder.fsPath] : [folder.fsPath, wslPath]
      } as ContentFolder);

      folders = uniqBy(folders, f => f.fsPath);
      await Folders.update(folders);

      Notifications.info(`Folder registered`);
    }

		Folders.updateVsCodeCtx();
  }

  /**
   * Unregister a folder path
   * @param folder 
   */
  public static async unregister(folder: Uri) {
    if (folder && folder.path) {
      let folders = Folders.get();
      folders = folders.filter(f => f.fsPath !== folder.fsPath);
      await Folders.update(folders);
    }
    
    Folders.updateVsCodeCtx();
  }

  /**
   * Update the registered folders context
   */
  public static updateVsCodeCtx() {
    const folders = Folders.get();
    let allFolders: string[] = [];
    for (const folder of folders) {
      allFolders = [...allFolders, ...folder.paths]
    }
    commands.executeCommand('setContext', CONTEXT.registeredFolders, allFolders);
  }

  /**
   * Retrieve the folder path
   * @param folder 
   * @returns 
   */
  public static getFolderPath(folder: Uri) {
    let folderPath = "";
		if (folder && folder.fsPath) {
			folderPath = folder.fsPath;
		} else if (workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
			folderPath = workspace.workspaceFolders[0].uri.fsPath;
		}
    return folderPath;
  }

  /**
   * Get the registered folders information
   */
  public static async getInfo(): Promise<FolderInfo[] | null> {
    const folders = Folders.get();
    if (folders && folders.length > 0) {
      let folderInfo: FolderInfo[] = [];
      
      for (const folder of folders) {
        try {
          const folderPath = Uri.file(folder.fsPath);
          const files = await workspace.fs.readDirectory(folderPath);
          if (files) {
            let fileStats: FileInfo[] = [];

            for (const file of files) {
              try {
                const fileName = file[0];
                const filePath = Uri.file(join(folderPath.fsPath, fileName));
                const stats = await workspace.fs.stat(filePath);
                fileStats.push({
                  filePath: filePath.fsPath,
                  fileName,
                  ...stats
                });
              } catch (error) {
                // Skip the file
              }
            }

            fileStats = fileStats.sort((a, b) => b.mtime - a.mtime).slice(0, 10);

            folderInfo.push({
              title: folder.title,
              files: files.length,
              lastModified: fileStats
            });
          }
        } catch (e) {
          // Skip the current folder
        }
      }

      return folderInfo;
    }

    return null;
  }

  /**
   * Get the folder settings
   * @returns 
   */
  private static get() {
    const config = SettingsHelper.getConfig();
    const folders: ContentFolder[] = config.get(SETTINGS_CONTENT_FOLDERS) as ContentFolder[];
    return folders;
  }
  
  /**
   * Update the folder settings
   * @param folders 
   */
  private static async update(folders: ContentFolder[]) {
    const config = SettingsHelper.getConfig();
    await config.update(SETTINGS_CONTENT_FOLDERS, folders);
  }
}