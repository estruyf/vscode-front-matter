import { STATIC_FOLDER_PLACEHOLDER } from './../constants/StaticFolderPlaceholder';
import { Questions } from './../helpers/Questions';
import { SETTING_CONTENT_PAGE_FOLDERS, SETTING_CONTENT_STATIC_FOLDER, SETTING_CONTENT_SUPPORTED_FILETYPES, TelemetryEvent } from './../constants';
import { commands, Uri, workspace, window } from "vscode";
import { basename, dirname, join, relative, sep } from "path";
import { ContentFolder, FileInfo, FolderInfo } from "../models";
import uniqBy = require("lodash.uniqby");
import { Template } from "./Template";
import { Notifications } from "../helpers/Notifications";
import { Logger, Settings } from "../helpers";
import { existsSync } from 'fs';
import { format } from 'date-fns';
import { Dashboard } from './Dashboard';
import { parseWinPath } from '../helpers/parseWinPath';
import { MediaHelpers } from '../helpers/MediaHelpers';
import { MediaListener, PagesListener, SettingsListener } from '../listeners/dashboard';
import { DEFAULT_FILE_TYPES } from '../constants/DefaultFileTypes';
import { Telemetry } from '../helpers/Telemetry';
import { glob } from 'glob';
import { mkdirAsync } from '../utils/mkdirAsync';
import { existsAsync } from '../utils';

export const WORKSPACE_PLACEHOLDER = `[[workspace]]`;

export class Folders {

  /**
   * Add a media folder
   * @returns
   */
  public static async addMediaFolder(data?: {selectedFolder?: string}) {
    const wsFolder = Folders.getWorkspaceFolder();
    const staticFolder = Folders.getStaticFolderRelativePath();

    let startPath = "";

    if (data?.selectedFolder) {
      startPath = data.selectedFolder.replace(parseWinPath(wsFolder?.fsPath || ""), "");
    } else if (staticFolder) {
      startPath = `/${staticFolder}`;
    }

    if (startPath && !startPath.endsWith("/")) {
      startPath += "/";
    }

    if (startPath.includes(STATIC_FOLDER_PLACEHOLDER.hexo.placeholder)) {
      startPath = startPath.replace(STATIC_FOLDER_PLACEHOLDER.hexo.placeholder, STATIC_FOLDER_PLACEHOLDER.hexo.postsFolder);
    }

    const folderName = await window.showInputBox({
      title: `Add media folder`,
      prompt: `Which name would you like to give to your folder (use "/" to create multi-level folders)?`,
      value: startPath,
      ignoreFocusOut: true,
      placeHolder: `${format(new Date(), `yyyy/MM`)}`
    });

    if (!folderName) {
      Notifications.warning(`No folder name was specified.`);
      return;
    }

    await Folders.createFolder(join(parseWinPath(wsFolder?.fsPath || ""), folderName));
  }

  public static async createFolder(folderPath: string) {
    if (!(await existsAsync(folderPath))) {
      await mkdirAsync(folderPath, { recursive: true });
    }

    if (Dashboard.isOpen) {
      MediaHelpers.resetMedia();
      MediaListener.sendMediaFiles(0, folderPath);
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
   * @param folderInfo
   */
  public static async register(folderInfo: { title: string, path: Uri } | Uri) {
    let folderName = folderInfo instanceof Uri ? undefined : folderInfo.title;
    const folder = folderInfo instanceof Uri ? folderInfo : folderInfo.path;

    if (folder && folder.fsPath) {
      const wslPath = folder.fsPath.replace(/\//g, '\\');

      let folders = Folders.get();

      const exists = folders.find(f => f.path.includes(folder.fsPath) || f.path.includes(wslPath));

      if (exists) {
        Notifications.warning(`Folder is already registered`);
        return;
      }

      if (!folderName) {
        folderName = await window.showInputBox({
          title: `Register folder`,
          prompt: `Which name would you like to specify for this folder?`,
          placeHolder: `Folder name`,
          value: basename(folder.fsPath),
          ignoreFocusOut: true
        });
      }

      folders.push({
        title: folderName,
        path: folder.fsPath
      } as ContentFolder);

      folders = uniqBy(folders, f => f.path);
      await Folders.update(folders);

      Notifications.info(`Folder registered`);

      Telemetry.send(TelemetryEvent.registerFolder);

      SettingsListener.getSettings(true);
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
   * Get the static folder its relative path
   * @returns
   */
  public static getStaticFolderRelativePath(): string | undefined {
    let staticFolder = Settings.get<string>(SETTING_CONTENT_STATIC_FOLDER);

    if (staticFolder && staticFolder.includes(WORKSPACE_PLACEHOLDER)) {
      staticFolder = Folders.getAbsFilePath(staticFolder);
      const wsFolder = Folders.getWorkspaceFolder();
      if (wsFolder) {
        const relativePath = relative(parseWinPath(wsFolder.fsPath), parseWinPath(staticFolder));
        return relativePath;
      }
    }

    return staticFolder;
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
        }).then(async (selectedFolder) => {
          if (selectedFolder) {
            await Settings.createGlobalFile(selectedFolder.uri);
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
    const wsFolder = parseWinPath(Folders.getWorkspaceFolder()?.fsPath || "");

    if (folders && folders.length > 0) {
      const folderInfo: FolderInfo[] = [];

      for (const folder of folders) {
        try {
          let projectStart = parseWinPath(folder.path).replace(wsFolder, "");

          if (typeof projectStart === 'string') {
            projectStart = projectStart.replace(/\\/g, '/');
            projectStart = projectStart.startsWith('/') ? projectStart.substring(1) : projectStart;

            let files: Uri[] = [];

            for (const fileType of (supportedFiles || DEFAULT_FILE_TYPES)) {
              let filePath = join(projectStart, folder.excludeSubdir ? '/' : '**', `*${fileType.startsWith('.') ? '' : '.'}${fileType}`);

              if (projectStart === '' && folder.excludeSubdir) {
                filePath = `*${fileType.startsWith('.') ? '' : '.'}${fileType}`;
              }

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

    const contentFolders = folders.map(folder => {
      if (!folder.title) {
        folder.title = basename(folder.path);
      }

      const folderPath = Folders.absWsFolder(folder, wsFolder);
      if (!existsSync(folderPath)) {
        Notifications.errorShowOnce(`Folder "${folder.title} (${folder.path})" does not exist. Please remove it from the settings.`, "Remove folder").then(answer => {
          if (answer === "Remove folder") {
            const folders = Folders.get();
            Folders.update(folders.filter(f => f.path !== folder.path));
          }
        });
        return null;
      }

      return {
        ...folder,
        path: folderPath
      }
    })

    return contentFolders.filter(folder => folder !== null) as ContentFolder[];
  }

  /**
   * Update the folder settings
   * @param folders
   */
  public static async update(folders: ContentFolder[]) {
    const wsFolder = Folders.getWorkspaceFolder();

    const folderDetails = folders.map(folder => ({
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
    return parseWinPath(absPath);
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
    return parseWinPath(absPath);
  }

  /**
   * Generate relative folder path
   * @param folder
   * @param wsFolder
   * @returns
   */
  public static relWsFolder(folder: ContentFolder, wsFolder?: Uri) {
    const isWindows = process.platform === 'win32';
    let absPath = parseWinPath(folder.path).replace(parseWinPath(wsFolder?.fsPath || ""), WORKSPACE_PLACEHOLDER);
    absPath = isWindows ? absPath.split('\\').join('/') : absPath;
    return absPath;
  }

  /**
   * Find the content folders
   */
  public static async getContentFolders() {
    // Find folders that contain files
    const wsFolder = Folders.getWorkspaceFolder();
    const supportedFiles = Settings.get<string[]>(SETTING_CONTENT_SUPPORTED_FILETYPES) || DEFAULT_FILE_TYPES;
    const patterns = supportedFiles.map(fileType => `${join(parseWinPath(wsFolder?.fsPath || ""), "**", `*${fileType.startsWith('.') ? '' : '.'}${fileType}`)}`);
    let folders: string[] = [];

    for (const pattern of patterns) {
      try {
        folders = [...folders, ...(await this.findFolders(pattern))];
      } catch (e) {
        Logger.error(`Something went wrong while searching for folders with pattern "${pattern}": ${(e as Error).message}`);
      }
    }

    // Filter out the workspace folder
    if (wsFolder) {
      folders = folders.filter(folder => folder !== wsFolder.fsPath);
    }

    const uniqueFolders = [...new Set(folders)];
    return uniqueFolders.map(folder => relative(wsFolder?.path || "", folder));
  }

  /**
   * Returns the file prefix for the given folder path
   * @param folderPath
   * @returns
   */
  public static getFilePrefixByFolderPath(folderPath: string) {
    const folders = Folders.get();
    const pageFolder = folders.find(f => parseWinPath(f.path) === parseWinPath(folderPath));

    if (pageFolder && typeof pageFolder.filePrefix !== "undefined") {
      return pageFolder.filePrefix;
    }

    return;
  }


  /**
   * Returns the file prefix for the given file path
   * @param filePath
   * @returns
   */
  public static getFilePrefixBeFilePath(filePath: string) {
    const folders = Folders.get();
    if (folders.length > 0) {
      filePath = parseWinPath(filePath);

      let selectedFolder: ContentFolder | null = null;
      for (const folder of folders) {
        const folderPath = parseWinPath(folder.path);
        if (filePath.startsWith(folderPath)) {
          if (!selectedFolder || selectedFolder.path.length < folderPath.length) {
            selectedFolder = folder;
          }
        }
      }

      if (selectedFolder && typeof selectedFolder.filePrefix !== "undefined") {
        return selectedFolder.filePrefix;
      }
    }

    return;
  }

  /**
   * Retrieve all content folders
   * @param pattern
   * @returns
   */
  private static findFolders(pattern: string): Promise<string[]> {
    return new Promise(resolve => {
      glob(pattern, { ignore: "**/node_modules/**" }, (err, files) => {
        const allFolders = files.map(file => dirname(file));
        const uniqueFolders = [...new Set(allFolders)];
        resolve(uniqueFolders);
      });
    });
  }
}
