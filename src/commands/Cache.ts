import { commands } from 'vscode';
import { COMMAND_NAME, ExtensionState } from '../constants';
import { Extension, Logger, Notifications } from '../helpers';

export class Cache {
  public static async registerCommands() {
    const ext = Extension.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(commands.registerCommand(COMMAND_NAME.clearCache, Cache.clear));
  }

  public static async get<T>(key: string, type: 'workspace' | 'global'): Promise<T | undefined> {
    const ext = Extension.getInstance();
    const cache = await ext.getState<T>(key, type);
    return cache || undefined;
  }

  public static async set(key: string, data: unknown, type: 'workspace' | 'global' = 'workspace') {
    await Extension.getInstance().setState(key, data, type);
  }

  public static async clear(showNotification: boolean = true) {
    const ext = Extension.getInstance();

    await ext.setState(ExtensionState.Dashboard.Pages.Cache, undefined, 'workspace', true);
    await ext.setState(ExtensionState.Dashboard.Pages.Index, undefined, 'workspace', true);
    await ext.setState(ExtensionState.Settings.Extends, undefined, 'workspace', true);

    if (showNotification) {
      Notifications.info('Cache cleared');
    } else {
      Logger.info('Cache cleared');
    }
  }
}
