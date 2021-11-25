import { Questions } from './../helpers/Questions';
import { SETTINGS_CONTENT_PAGE_FOLDERS, SETTINGS_CONTENT_STATIC_FOLDER } from './../constants';
import { commands, Uri, workspace, window } from "vscode";
import { basename, join } from "path";
import { ContentFolder, FileInfo, FolderInfo } from "../models";
import uniqBy = require("lodash.uniqby");
import { Template } from "./Template";
import { Notifications } from "../helpers/Notifications";
import { Settings } from "../helpers";
import { existsSync, mkdirSync } from 'fs';
import { format } from 'date-fns';
import { Dashboard } from './Dashboard';
import { parseWinPath } from '../helpers/parseWinPath';

export const WORKSPACE_PLACEHOLDER = `[[workspace]]`;

export class Folders {

  /**
   * Add a media folder
   * @returns 
   */
  public static async addMediaFolder(data?: {selectedFolder?: string}) {
    let wsFolder = Folders.getWorkspaceFolder();
    const staticFolder = Settings.get<string>(SETTINGS_CONTENT_STATIC_FOLDER);

    let startPath = "";

    if (data?.selectedFolder) {
      startPath = data.selectedFolder.replace(parseWinPath(wsFolder?.fsPath || ""), "");
    } else if (staticFolder) {
      startPath = `/${staticFolder}`;
    }

    if (startPath && !startPath.endsWith("/")) {
      startPath += "/";
    }

    const folderName = await window.showInputBox({  
      prompt: `Which name would you like to give to your folder (use "/" to create multi-level folders)?`,
      value: startPath,
      ignoreFocusOut: true,
      placeHolder: `${format(new Date(), `yyyy/MM`)}`
    });

    if (!folderName) {
      Notifications.warning(`No folder name was specified.`);
      return;
    }
    
    const folders = folderName.split("/").filter(f => f);
    let parentFolders: string[] = [];

    for (const folder of folders) {
      const folderPath = join(parseWinPath(wsFolder?.fsPath || ""), parentFolders.join("/"), folder);

      parentFolders.push(folder);
      
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath);
      }
    }

    if (Dashboard.isOpen) {
      Dashboard.switchFolder(folderName);
    }
  }

  /**
   * Create content in a registered folder
   * @returns 
   */
  public static async create() {
    const selectedFolder = await Questions.SelectContentFolder();
    if (!selectedFolder) {
      return;
    }

    const folders = Folders.get();
    const location = folders.find(f => f.title === selectedFolder);
    if (location) {
      const folderPath = Folders.getFolderPath(Uri.file(location.path));
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

      const exists = folders.find(f => f.path.includes(folder.fsPath) || f.path.includes(wslPath));

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
        path: folder.fsPath
      } as ContentFolder);

      folders = uniqBy(folders, f => f.path);
      await Folders.update(folders);

      Notifications.info(`Folder registered`);
    }
  }

  /**
   * Unregister a folder path
   * @param folder 
   */
  public static async unregister(folder: Uri) {
    if (folder && folder.path) {
      let folders = Folders.get();
      folders = folders.filter(f => f.path !== folder.fsPath);
      await Folders.update(folders);
    }
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
    
    if (folders && folders.length === 1) {
      return folders[0].uri;
    } else if (folders && folders.length > 1) {
      let projectFolder = undefined; 
      
      for (const folder of folders) {
        if (!projectFolder && existsSync(join(folder.uri.fsPath, Settings.globalFile))) {
          projectFolder = folder.uri;
        }
      }

      if (!projectFolder) {
        window.showWorkspaceFolderPick({
          placeHolder: `Please select the main workspace folder for Front Matter to use.`
        }).then(selectedFolder => {
          if (selectedFolder) {
            Settings.createGlobalFile(selectedFolder.uri);
            // Full reload to make sure the whole extension is reloaded correctly
            commands.executeCommand(`workbench.action.reloadWindow`);
          }
        });
      }

      return projectFolder;
    }
    
    return undefined;
  }

  /**
   * Get the name of the project
   */
  public static getProjectFolderName(): string {
    const wsFolder = Folders.getWorkspaceFolder();
    if (wsFolder) {
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
          let projectStart = folder.path.split(projectName).pop();
          
          if (projectStart) {
            projectStart = projectStart.replace(/\\/g, '/');
            projectStart = projectStart.startsWith('/') ? projectStart.substr(1) : projectStart;
            const mdFiles = await workspace.findFiles(join(projectStart, folder.excludeSubdir ? '/' : '**/', '*.md'));
            const markdownFiles = await workspace.findFiles(join(projectStart, folder.excludeSubdir ? '/' : '**/', '*.markdown'));
            const mdxFiles = await workspace.findFiles(join(projectStart, folder.excludeSubdir ? '/' : '**/', '*.mdx'));
            let files = [...mdFiles, ...markdownFiles, ...mdxFiles];
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
  public static get(): ContentFolder[] {
    const wsFolder = Folders.getWorkspaceFolder();
    const folders: ContentFolder[] = Settings.get(SETTINGS_CONTENT_PAGE_FOLDERS) as ContentFolder[];
    
    return folders.map(folder => ({
      ...folder,
      path: Folders.absWsFolder(folder, wsFolder)
    }));
  }
  
  /**
   * Update the folder settings
   * @param folders 
   */
  private static async update(folders: ContentFolder[]) {
    const wsFolder = Folders.getWorkspaceFolder();

    let folderDetails = folders.map(folder => ({ 
      ...folder,
      path: Folders.relWsFolder(folder, wsFolder) 
    }));

    await Settings.update(SETTINGS_CONTENT_PAGE_FOLDERS, folderDetails, true);
  }

  /**
   * Generate the absolute URL for the workspace
   * @param folder 
   * @param wsFolder 
   * @returns 
   */
  private static absWsFolder(folder: ContentFolder, wsFolder?: Uri) {
    const isWindows = process.platform === 'win32';
    let absPath =  folder.path.replace(WORKSPACE_PLACEHOLDER, parseWinPath(wsFolder?.fsPath || ""));
    absPath = isWindows ? absPath.split('/').join('\\') : absPath;
    return absPath;
  }

  /**
   * Generate relative folder path
   * @param folder 
   * @param wsFolder 
   * @returns 
   */
  private static relWsFolder(folder: ContentFolder, wsFolder?: Uri) {
    const isWindows = process.platform === 'win32';
    let absPath =  folder.path.replace(parseWinPath(wsFolder?.fsPath || ""), WORKSPACE_PLACEHOLDER);
    absPath = isWindows ? absPath.split('\\').join('/') : absPath;
    return absPath;
  }
}