import { Config, JsonDB } from 'node-json-db';
import { Folders } from '../commands';
import { join } from 'path';
import { LocalStore } from '../constants';
import { FilesHelper, parseWinPath } from '../helpers';

const PINNED_DB = '/pinned';

export class PinnedItems {
  /**
   * Retrieve all the pinned items
   * @returns
   */
  public static async get() {
    const db = PinnedItems.getPinnedDb();
    if (!db) {
      return undefined;
    }

    let allPinned: string[] = [];
    if (await db.exists(PINNED_DB)) {
      allPinned = (await db.getObject(PINNED_DB)) as string[];
    }

    return allPinned;
  }

  /**
   * Pin an item
   * @param path
   */
  public static async pin(path: string) {
    if (!path) {
      return;
    }

    const relPath = FilesHelper.absToRelPath(path);
    if (!relPath) {
      return;
    }

    const db = PinnedItems.getPinnedDb();
    if (!db) {
      return;
    }

    let allPinned: string[] = [];
    if (await db.exists(PINNED_DB)) {
      allPinned = (await db.getObject(PINNED_DB)) as string[];
    }

    allPinned.push(relPath);
    allPinned = [...new Set(allPinned)];

    await db.push(PINNED_DB, allPinned, true);

    return allPinned;
  }

  /**
   * Remove a pinned item
   * @param path
   * @returns
   */
  public static async remove(path: string) {
    if (!path) {
      return;
    }

    const relPath = FilesHelper.absToRelPath(path);
    if (!relPath) {
      return;
    }

    const db = PinnedItems.getPinnedDb();
    if (!db) {
      return;
    }

    let allPinned: string[] = [];
    if (await db.exists(PINNED_DB)) {
      allPinned = (await db.getObject(PINNED_DB)) as string[];
    }

    allPinned = allPinned.filter((p) => p !== relPath);

    await db.push(PINNED_DB, allPinned, true);

    return allPinned;
  }

  /**
   * Retrieve the pinned database
   * @returns
   */
  private static getPinnedDb() {
    const wsFolder = Folders.getWorkspaceFolder();
    if (!wsFolder) {
      return;
    }

    const dbFolder = join(
      parseWinPath(wsFolder?.fsPath || ''),
      LocalStore.rootFolder,
      LocalStore.databaseFolder
    );
    const dbPath = join(dbFolder, LocalStore.pinnedItemsDatabaseFile);

    return new JsonDB(new Config(dbPath, true, false, '/'));
  }
}
