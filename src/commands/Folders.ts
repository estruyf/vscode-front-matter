import { STATIC_FOLDER_PLACEHOLDER } from './../constants/StaticFolderPlaceholder';
import { Questions } from './../helpers/Questions';
import {
  SETTING_CONTENT_PAGE_FOLDERS,
  SETTING_CONTENT_STATIC_FOLDER,
  SETTING_CONTENT_SUPPORTED_FILETYPES,
  SETTING_DATE_FORMAT,
  TelemetryEvent
} from './../constants';
import { commands, Uri, workspace, window } from 'vscode';
import { basename, dirname, join, relative, sep } from 'path';
import { ContentFolder, FileInfo, FolderInfo, StaticFolder } from '../models';
import uniqBy = require('lodash.uniqby');
import { Template } from './Template';
import { Notifications } from '../helpers/Notifications';
import { Logger, Settings, processTimePlaceholders } from '../helpers';
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
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';

export const WORKSPACE_PLACEHOLDER = `[[workspace]]`;

export class Folders {
  /**
   * Add a media folder
   * @returns
   */
  public static async addMediaFolder(data?: { selectedFolder?: string }) {
    const wsFolder = Folders.getWorkspaceFolder();
    const staticFolder = Folders.getStaticFolderRelativePath();

    let startPath = '';

    if (data?.selectedFolder) {
      startPath = data.selectedFolder.replace(parseWinPath(wsFolder?.fsPath || ''), '');
    } else if (staticFolder) {
      startPath = `/${staticFolder}`;
    }

    if (startPath && !startPath.endsWith('/')) {
      startPath += '/';
    }

    if (startPath.includes(STATIC_FOLDER_PLACEHOLDER.hexo.placeholder)) {
      startPath = startPath.replace(
        STATIC_FOLDER_PLACEHOLDER.hexo.placeholder,
        STATIC_FOLDER_PLACEHOLDER.hexo.postsFolder
      );
    }

    const folderName = await window.showInputBox({
      title: l10n.t(LocalizationKey.commandsFoldersAddMediaFolderInputBoxTitle),
      prompt: l10n.t(LocalizationKey.commandsFoldersAddMediaFolderInputBoxPrompt),
      value: startPath,
      ignoreFocusOut: true,
      placeHolder: `${format(new Date(), `yyyy/MM`)}`
    });

    if (!folderName) {
      Notifications.warning(l10n.t(LocalizationKey.commandsFoldersAddMediaFolderNoFolderWarning));
      return;
    }

    await Folders.createFolder(join(parseWinPath(wsFolder?.fsPath || ''), folderName));
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

    const folders = Folders.get().filter((f) => !f.disableCreation);
    const location = folders.find((f) => f.title === selectedFolder);
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
  public static async register(
    folderInfo: { title: string; path: Uri; contentType: string[] } | Uri
  ) {
    let folderName = folderInfo instanceof Uri ? undefined : folderInfo.title;
    const folder = folderInfo instanceof Uri ? folderInfo : folderInfo.path;
    const contentType = folderInfo instanceof Uri ? undefined : folderInfo.contentType;

    if (folder && folder.fsPath) {
      const wslPath = folder.fsPath.replace(/\//g, '\\');

      let folders = Folders.get();

      const exists = folders.find(
        (f) => f.path.includes(folder.fsPath) || f.path.includes(wslPath)
      );

      if (exists) {
        Notifications.warning(l10n.t(LocalizationKey.commandsFoldersCreateFolderExistsWarning));
        return;
      }

      if (!folderName) {
        folderName = await window.showInputBox({
          title: l10n.t(LocalizationKey.commandsFoldersCreateInputTitle),
          prompt: l10n.t(LocalizationKey.commandsFoldersCreateInputPrompt),
          placeHolder: l10n.t(LocalizationKey.commandsFoldersCreateInputPlaceholder),
          value: basename(folder.fsPath),
          ignoreFocusOut: true
        });
      }

      const contentFolder = {
        title: folderName,
        path: folder.fsPath
      } as ContentFolder;

      if (contentType) {
        contentFolder.contentTypes = typeof contentType === 'string' ? [contentType] : contentType;
      }

      folders.push(contentFolder);

      folders = uniqBy(folders, (f) => f.path);
      await Folders.update(folders);

      Notifications.info(l10n.t(LocalizationKey.commandsFoldersCreateSuccess));

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
      folders = folders.filter((f) => f.path !== folder.fsPath);
      await Folders.update(folders);

      Telemetry.send(TelemetryEvent.unregisterFolder);
    }
  }

  /**
   * Get the static folder its relative path
   * @returns
   */
  public static getStaticFolderRelativePath(): string | undefined {
    const staticFolder = Settings.get<string | StaticFolder>(SETTING_CONTENT_STATIC_FOLDER);

    let assetFolder: string | undefined;

    if (staticFolder && typeof staticFolder !== 'string' && staticFolder.path) {
      assetFolder = staticFolder.path;
    } else if (staticFolder && typeof staticFolder === 'string') {
      assetFolder = staticFolder;
    }

    if (
      assetFolder &&
      (assetFolder.includes(WORKSPACE_PLACEHOLDER) || assetFolder === '/' || assetFolder === './')
    ) {
      assetFolder =
        assetFolder === '/' || assetFolder === './'
          ? Folders.getAbsFilePath(WORKSPACE_PLACEHOLDER)
          : Folders.getAbsFilePath(assetFolder);
      const wsFolder = Folders.getWorkspaceFolder();
      if (wsFolder) {
        const relativePath = relative(parseWinPath(wsFolder.fsPath), parseWinPath(assetFolder));
        return relativePath === '' ? '/' : relativePath;
      }
    }

    return assetFolder || '/';
  }

  /**
   * Retrieve the folder path
   * @param folder
   * @returns
   */
  public static getFolderPath(folder: Uri) {
    let folderPath = '';
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
        window
          .showWorkspaceFolderPick({
            placeHolder: l10n.t(
              LocalizationKey.commandsFoldersGetWorkspaceFolderWorkspaceFolderPickPlaceholder
            )
          })
          .then(async (selectedFolder) => {
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
    return '';
  }

  /**
   * Get the registered folders information
   */
  public static async getInfo(limit?: number): Promise<FolderInfo[] | null> {
    const supportedFiles = Settings.get<string[]>(SETTING_CONTENT_SUPPORTED_FILETYPES);
    const folders = Folders.get();
    const wsFolder = parseWinPath(Folders.getWorkspaceFolder()?.fsPath || '');

    if (folders && folders.length > 0) {
      const folderInfo: FolderInfo[] = [];

      for (const folder of folders) {
        try {
          const folderPath = parseWinPath(folder.path);

          if (typeof folderPath === 'string') {
            let files: Uri[] = [];

            for (const fileType of supportedFiles || DEFAULT_FILE_TYPES) {
              let filePath = join(
                folderPath,
                folder.excludeSubdir ? '/' : '**',
                `*${fileType.startsWith('.') ? '' : '.'}${fileType}`
              );

              if (folderPath === '' && folder.excludeSubdir) {
                filePath = `*${fileType.startsWith('.') ? '' : '.'}${fileType}`;
              }

              let foundFiles = await Folders.findFiles(filePath);

              // Make sure these file are coming from the folder path (this could be an issue in multi-root workspaces)
              foundFiles = foundFiles.filter((f) => parseWinPath(f.fsPath).startsWith(folderPath));

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
    let folders: ContentFolder[] = Settings.get(SETTING_CONTENT_PAGE_FOLDERS) as ContentFolder[];

    // Filter out folders without a path
    folders = folders.filter((f) => f.path);

    const contentFolders = folders.map((folder) => {
      if (!folder.title) {
        folder.title = basename(folder.path);
      }

      let folderPath: string | undefined = Folders.absWsFolder(folder, wsFolder);
      if (folderPath.includes(`{{`) && folderPath.includes(`}}`)) {
        const dateFormat = Settings.get(SETTING_DATE_FORMAT) as string;
        folderPath = processTimePlaceholders(folderPath, dateFormat);
      } else {
        if (folderPath && !existsSync(folderPath)) {
          Notifications.errorShowOnce(
            l10n.t(
              LocalizationKey.commandsFoldersGetNotificationErrorTitle,
              `${folder.title} (${folder.path})`
            ),
            l10n.t(LocalizationKey.commandsFoldersGetNotificationErrorRemoveAction),
            l10n.t(LocalizationKey.commandsFoldersGetNotificationErrorCreateAction)
          ).then((answer) => {
            if (
              answer === l10n.t(LocalizationKey.commandsFoldersGetNotificationErrorRemoveAction)
            ) {
              const folders = Folders.get();
              Folders.update(folders.filter((f) => f.path !== folder.path));
            } else if (
              answer === l10n.t(LocalizationKey.commandsFoldersGetNotificationErrorCreateAction)
            ) {
              mkdirAsync(folderPath as string, { recursive: true });
            }
          });
          return null;
        }
      }

      return {
        ...folder,
        originalPath: folder.path,
        path: folderPath
      };
    });

    return contentFolders.filter((folder) => folder !== null) as ContentFolder[];
  }

  /**
   * Update the folder settings
   * @param folders
   */
  public static async update(folders: ContentFolder[]) {
    const wsFolder = Folders.getWorkspaceFolder();

    const folderDetails = folders
      .map((folder) => {
        const detail = {
          ...folder,
          path: Folders.relWsFolder(folder, wsFolder)
        };

        if (detail['$schema'] || detail.extended) {
          return null;
        }

        delete detail.originalPath;

        return detail;
      })
      .filter((folder) => folder !== null);

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

    if (filePath.includes(WORKSPACE_PLACEHOLDER)) {
      let absPath = filePath.replace(WORKSPACE_PLACEHOLDER, parseWinPath(wsFolder?.fsPath || ''));
      absPath = isWindows ? absPath.split('/').join('\\') : absPath;
      return parseWinPath(absPath);
    }

    return parseWinPath(join(parseWinPath(wsFolder?.fsPath || ''), filePath));
  }

  /**
   * Retrieve the absolute folder path
   * @param filePath
   * @returns
   */
  public static getAbsFolderPath(folderPath: string): string {
    const wsFolder = Folders.getWorkspaceFolder();
    const isWindows = process.platform === 'win32';

    let absPath = '';
    if (folderPath.includes(WORKSPACE_PLACEHOLDER)) {
      absPath = folderPath.replace(WORKSPACE_PLACEHOLDER, parseWinPath(wsFolder?.fsPath || ''));
    } else {
      absPath = join(parseWinPath(wsFolder?.fsPath || ''), folderPath);
    }

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
    let absPath = folder.path.replace(WORKSPACE_PLACEHOLDER, parseWinPath(wsFolder?.fsPath || ''));

    if (absPath.includes('../')) {
      absPath = join(absPath);
    }

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
    let absPath = parseWinPath(folder.path).replace(
      parseWinPath(wsFolder?.fsPath || ''),
      WORKSPACE_PLACEHOLDER
    );
    absPath = isWindows ? absPath.split('\\').join('/') : absPath;
    return absPath;
  }

  /**
   * Find the content folders
   */
  public static async getContentFolders() {
    // Find folders that contain files
    const wsFolder = Folders.getWorkspaceFolder();
    if (!wsFolder) {
      return [];
    }

    const supportedFiles =
      Settings.get<string[]>(SETTING_CONTENT_SUPPORTED_FILETYPES) || DEFAULT_FILE_TYPES;
    const patterns = supportedFiles.map(
      (fileType) =>
        `${join(
          parseWinPath(wsFolder?.fsPath || ''),
          '**',
          `*${fileType.startsWith('.') ? '' : '.'}${fileType}`
        )}`
    );
    let folders: string[] = [];

    for (const pattern of patterns) {
      try {
        folders = [...folders, ...(await this.findFolders(pattern))];
      } catch (e) {
        Logger.error(
          `Something went wrong while searching for folders with pattern "${pattern}": ${
            (e as Error).message
          }`
        );
      }
    }

    // Filter out the workspace folder
    if (wsFolder) {
      folders = folders.filter((folder) => folder !== wsFolder.fsPath);
    }

    const uniqueFolders = [...new Set(folders)];
    return uniqueFolders.map((folder) => relative(wsFolder?.path || '', folder));
  }

  /**
   * Returns the file prefix for the given folder path
   * @param folderPath
   * @returns
   */
  public static getFilePrefixByFolderPath(folderPath: string) {
    const folders = Folders.get();
    const pageFolder = folders.find((f) => parseWinPath(f.path) === parseWinPath(folderPath));

    if (pageFolder && typeof pageFolder.filePrefix !== 'undefined') {
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

      if (selectedFolder && typeof selectedFolder.filePrefix !== 'undefined') {
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
    return new Promise((resolve) => {
      glob(pattern, { ignore: '**/node_modules/**', dot: true }, (err, files) => {
        const allFolders = files.map((file) => dirname(file));
        const uniqueFolders = [...new Set(allFolders)];
        resolve(uniqueFolders);
      });
    });
  }

  /**
   * Find all files
   * @param pattern
   * @returns
   */
  private static async findFiles(pattern: string): Promise<Uri[]> {
    return new Promise((resolve) => {
      glob(pattern, { ignore: '**/node_modules/**' }, (err, files) => {
        const allFiles = files.map((file) => Uri.file(file));
        resolve(allFiles);
      });
    });
  }
}
