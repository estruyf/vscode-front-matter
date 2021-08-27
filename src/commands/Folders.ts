import { commands, Uri, workspace, window } from "vscode";
import { SETTINGS_CONTENT_FOLDERS } from "../constants";
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

    let selectedFolder: string | undefined;
    if (folders.length > 1) {
      selectedFolder = await window.showQuickPick(folders.map(f => f.title), {
        placeHolder: `Select where you want to create your content`
      });
    } else {
      selectedFolder = folders[0].title;
    }

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
    const wsFolder = Folders.getWorkspaceFolder();
		if (folder && folder.fsPath) {
			folderPath = folder.fsPath;
		} else if (wsFolder) {
			folderPath = wsFolder.fsPath;
		}
    return folderPath;
  }

  /**
   * Retrieve the workspace folder
   */
  public static getWorkspaceFolder(): Uri | undefined {
    const folders = workspace.workspaceFolders;
    if (folders && folders.length > 0) {
      return folders[0].uri;
    }
    return undefined;
  }

  /**
   * Get the name of the project
   */
  public static getProjectFolderName(): string {
    const wsFolder = Folders.getWorkspaceFolder();
    if (wsFolder) {
      // const projectFolder = wsFolder?.fsPath.split('\\').join('/').split('/').pop();
      return basename(wsFolder.fsPath);
    }
    return "";
  }

  /**
   * Get the registered folders information
   */
  public static async getInfo(limit?: number): Promise<FolderInfo[] | null> {
    const folders = Folders.get();
    if (folders && folders.length > 0) {
      let folderInfo: FolderInfo[] = [];
      
      for (const folder of folders) {
        try {
          const projectName = Folders.getProjectFolderName();
          let projectStart = folder.fsPath.split(projectName).pop();
          if (projectStart) {
            projectStart = projectStart.replace(/\\/g, '/');
            projectStart = projectStart.startsWith('/') ? projectStart.substr(1) : projectStart;
            const mdFiles = await workspace.findFiles(join(projectStart, '**/*.md'));
            const mdxFiles = await workspace.findFiles(join(projectStart, '**/*.mdx'));
            let files = [...mdFiles, ...mdxFiles];
            if (files) {
              let fileStats: FileInfo[] = [];

              for (const file of files) {
                try {
                  const fileName = basename(file.fsPath);
                  const stats = await workspace.fs.stat(file);
                  fileStats.push({
                    filePath: file.fsPath,
                    fileName,
                    ...stats
                  });
                } catch (error) {
                  // Skip the file
                }
              }

              fileStats = fileStats.sort((a, b) => b.mtime - a.mtime);
              
              if (limit) {
                fileStats = fileStats.slice(0, limit);
              }

              folderInfo.push({
                title: folder.title,
                files: files.length,
                lastModified: fileStats
              });
            }
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
  public static get() {
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