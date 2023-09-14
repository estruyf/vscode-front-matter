import { MediaHelpers } from './MediaHelpers';
import { Disposable, workspace } from 'vscode';
import { Config, JsonDB } from 'node-json-db';
import { basename, dirname, join, parse } from 'path';
import { Folders, WORKSPACE_PLACEHOLDER } from '../commands/Folders';
import { Notifications } from './Notifications';
import { parseWinPath } from './parseWinPath';
import { LocalStore } from '../constants';
import { existsAsync, renameAsync } from '../utils';
import { existsSync, mkdirSync, renameSync } from 'fs';

interface MediaRecord {
  description: string;
  alt: string;
}

export class MediaLibrary {
  private db: JsonDB | undefined;
  private renameFilesListener: Disposable | undefined;
  private static instance: MediaLibrary;

  private constructor() {
    const wsFolder = Folders.getWorkspaceFolder();
    if (!wsFolder) {
      return;
    }

    // In version 8.4.0 we moved to a new database location
    // This is to ensure that the database is moved to the new location
    const oldDbPath = join(
      parseWinPath(wsFolder?.fsPath || ''),
      LocalStore.rootFolder,
      LocalStore.contentFolder,
      LocalStore.mediaDatabaseFile
    );

    const dbFolder = join(
      parseWinPath(wsFolder?.fsPath || ''),
      LocalStore.rootFolder,
      LocalStore.databaseFolder
    );
    const dbPath = join(dbFolder, LocalStore.mediaDatabaseFile);

    if (existsSync(oldDbPath)) {
      // Check if the database folder exists
      if (!existsSync(dbFolder)) {
        mkdirSync(dbFolder, { recursive: true });
      }
      // Move the database file
      if (existsSync(oldDbPath)) {
        renameSync(oldDbPath, dbPath);
      }
    }

    this.db = new JsonDB(
      new Config(
        join(
          parseWinPath(wsFolder?.fsPath || ''),
          LocalStore.rootFolder,
          LocalStore.databaseFolder,
          LocalStore.mediaDatabaseFile
        ),
        true,
        false,
        '/'
      )
    );

    if (this.renameFilesListener) {
      this.renameFilesListener.dispose();
    }

    this.renameFilesListener = workspace.onDidRenameFiles((e) => {
      e.files.forEach(async (f) => {
        const path = f.oldUri.path.toLowerCase();
        // Check if file is an image
        if (
          path.endsWith('.jpeg') ||
          path.endsWith('.jpg') ||
          path.endsWith('.png') ||
          path.endsWith('.gif') ||
          path.endsWith('.mp4') ||
          path.endsWith('.pdf')
        ) {
          await this.rename(f.oldUri.fsPath, f.newUri.fsPath);
          MediaHelpers.resetMedia();
        }
      });
    });
  }

  public static getInstance(): MediaLibrary {
    if (!MediaLibrary.instance) {
      MediaLibrary.instance = new MediaLibrary();
    }

    return MediaLibrary.instance;
  }

  public static reset() {
    MediaLibrary.instance = new MediaLibrary();
  }

  public async get(id: string): Promise<MediaRecord | undefined> {
    try {
      const fileId = this.parsePath(id);
      if (await this.db?.exists(fileId)) {
        return await this.db?.getData(fileId);
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  public async getAll() {
    try {
      const data = await this.db?.getData('/');
      return data;
    } catch {
      return undefined;
    }
  }

  public set(id: string, metadata: any): void {
    const fileId = this.parsePath(id);
    this.db?.push(fileId, metadata, true);
  }

  public async rename(oldId: string, newId: string): Promise<void> {
    const fileId = this.parsePath(oldId);
    const newFileId = this.parsePath(newId);
    const data = await this.get(fileId);
    if (data) {
      this.db?.delete(fileId);
      this.db?.push(newFileId, data, true);
    }
  }

  public async updateFilename(filePath: string, filename: string) {
    const name = basename(filePath);

    if (name !== filename && filename) {
      try {
        const oldFileInfo = parse(filePath);
        const newFileInfo = parse(filename);
        const newPath = join(dirname(filePath), `${newFileInfo.name}${oldFileInfo.ext}`);

        if (await existsAsync(newPath)) {
          Notifications.warning(`The name "${filename}" already exists at the file location.`);
        } else {
          await renameAsync(filePath, newPath);
          await this.rename(filePath, newPath);
          MediaHelpers.resetMedia();
        }
      } catch (err) {
        Notifications.error(`Something went wrong updating "${name}" to "${filename}".`);
      }
    }
  }

  public parsePath(path: string) {
    const wsFolder = Folders.getWorkspaceFolder();
    const isWindows = process.platform === 'win32';
    let absPath = path.replace(parseWinPath(wsFolder?.fsPath || ''), WORKSPACE_PLACEHOLDER);
    absPath = isWindows ? absPath.split('\\').join('/') : absPath;
    return absPath.toLowerCase();
  }
}
