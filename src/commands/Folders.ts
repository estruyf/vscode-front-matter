import { Questions } from './../helpers/Questions';
import { SETTING_CONTENT_PAGE_FOLDERS, SETTING_CONTENT_STATIC_FOLDER, SETTING_CONTENT_SUPPORTED_FILETYPES, TelemetryEvent } from './../constants';
import { commands, Uri, workspace, window } from "vscode";
import { basename, dirname, join, sep } from "path";
import { ContentFolder, FileInfo, FolderInfo } from "../models";
import uniqBy = require("lodash.uniqby");
import { Template } from "./Template";
import { Notifications } from "../helpers/Notifications";
import { Settings } from "../helpers";
import { existsSync, mkdirSync } from 'fs';
import { format } from 'date-fns';
import { Dashboard } from './Dashboard';
import { parseWinPath } from '../helpers/parseWinPath';
import { MediaHelpers } from '../helpers/MediaHelpers';
import { MediaListener, PagesListener } from '../listeners/dashboard';
import { DEFAULT_FILE_TYPES } from '../constants/DefaultFileTypes';
import { Telemetry } from '../helpers/Telemetry';

export const WORKSPACE_PLACEHOLDER = `[[workspace]]`;

export class Folders {

  /**
   * Add a media folder
   * @returns 
   */
  public static async addMediaFolder(data?: {selectedFolder?: string}) {
    let wsFolder = Folders.getWorkspaceFolder();
    const staticFolder = Settings.get<string>(SETTING_CONTENT_STATIC_FOLDER);

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
      MediaHelpers.resetMedia();
      MediaListener.sendMediaFiles(0, folderName);
    }

    Telemetry.send(TelemetryEvent.addMediaFolder);
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

		  Telemetry.send(TelemetryEvent.registerFolder);
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

		  Telemetry.send(TelemetryEvent.unregisterFolder);
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
    const supportedFiles = Settings.get<string[]>(SETTING_CONTENT_SUPPORTED_FILETYPES);
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

            let files: Uri[] = [];
            
            for (const fileType of (supportedFiles || DEFAULT_FILE_TYPES)) {
              const filePath = join(projectStart, folder.excludeSubdir ? '/' : '**', `*${fileType.startsWith('.') ? '' : '.'}${fileType}`);
              const foundFiles = await workspace.findFiles(filePath, '**/node_modules/**');
              files = [...files, ...foundFiles];
            }
            
            if (files) {
              let fileStats: FileInfo[] = [];

              for (const file of files) {
                try {
                  const fileName = basename(file.fsPath);
                  const folderName = dirname(file.fsPath).split(sep).pop();
                  
                  const stats = await workspace.fs.stat(file);

                  fileStats.push({
                    filePath: file.fsPath,
                    fileName,
                    folderName,
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
    const folders: ContentFolder[] = Settings.get(SETTING_CONTENT_PAGE_FOLDERS) as ContentFolder[];
    
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

    await Settings.update(SETTING_CONTENT_PAGE_FOLDERS, folderDetails, true);

    // Reinitialize the folder listeners
    PagesListener.startWatchers();
  }

  /**
   * Retrieve the absolute file path
   * @param filePath 
   * @returns 
   */
  public static getAbsFilePath(filePath: string): string {
    const wsFolder = Folders.getWorkspaceFolder();
    const isWindows = process.platform === 'win32';
    let absPath = filePath.replace(WORKSPACE_PLACEHOLDER, parseWinPath(wsFolder?.fsPath || ""));
    absPath = isWindows ? absPath.split('/').join('\\') : absPath;
    return absPath;
  }

  /**
   * Generate the absolute URL for the workspace
   * @param folder 
   * @param wsFolder 
   * @returns 
   */
  private static absWsFolder(folder: ContentFolder, wsFolder?: Uri) {
    const isWindows = process.platform === 'win32';
    let absPath = folder.path.replace(WORKSPACE_PLACEHOLDER, parseWinPath(wsFolder?.fsPath || ""));
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
    let absPath = parseWinPath(folder.path).replace(parseWinPath(wsFolder?.fsPath || ""), WORKSPACE_PLACEHOLDER);
    absPath = isWindows ? absPath.split('\\').join('/') : absPath;
    return absPath;
  }
}
