import { Dashboard } from '../commands/Dashboard';
import { workspace } from 'vscode';
import { JsonDB } from 'node-json-db/dist/JsonDB';
import { join } from 'path';
import { Folders, WORKSPACE_PLACEHOLDER } from '../commands/Folders';

interface MediaRecord {
  description: string;
  alt: string;
}

export class MediaLibrary {
  private db: JsonDB;
  private static instance: MediaLibrary;

  private constructor() {
    const wsFolder = Folders.getWorkspaceFolder();
    this.db = new JsonDB(join(wsFolder?.fsPath || "", '.frontmatter/mediaDb.json'), true, false, '/');

    workspace.onDidRenameFiles(e => {
      e.files.forEach(f => {
        // Check if file is an image
        if (f.oldUri.path.endsWith('.jpeg') || 
            f.oldUri.path.endsWith('.jpg') || 
            f.oldUri.path.endsWith('.png') || 
            f.oldUri.path.endsWith('.gif')) {
          this.rename(f.oldUri.fsPath, f.newUri.fsPath);
          Dashboard.resetMedia();
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

  public get(id: string): MediaRecord | undefined {
    try {
      const fileId = this.parsePath(id);
      if (this.db.exists(fileId)) {
        return this.db.getData(fileId);
      } 
      return undefined;
    } catch {
      return undefined;
    }
  }

  public set(id: string, description: string | null = null, alt: string | null = null): void {
    const fileId = this.parsePath(id);
    this.db.push(fileId, { description, alt }, true);
  }

  public rename(oldId: string, newId: string): void {
    const fileId = this.parsePath(oldId);
    const newFileId = this.parsePath(newId);
    const data = this.db.getData(fileId);
    if (data) {
      this.db.delete(fileId);
      this.db.push(newFileId, data, true);
    }
  }

  private parsePath(path: string) {
    const wsFolder = Folders.getWorkspaceFolder();
    const isWindows = process.platform === 'win32';
    let absPath = path.replace(wsFolder?.fsPath || "", WORKSPACE_PLACEHOLDER);
    absPath = isWindows ? absPath.split('\\').join('/') : absPath;
    return absPath.toLowerCase();
  }
}