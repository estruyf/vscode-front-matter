import { commands } from "vscode";
import { COMMAND_NAME, ExtensionState } from "../constants";
import { Extension, Notifications } from "../helpers";

export class Cache {

  public static async registerCommands() {
    const ext = Extension.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND_NAME.clearCache, Cache.clear)
    );
  }

  public static async get<T>(key: string, type: "workspace" | "global"): Promise<T | undefined> {
    const ext = Extension.getInstance();
    const cache = await ext.getState<T>(key, type);
    return cache || undefined;
  }

  public static async set(key: string, data: any, type: "workspace" | "global") {
    await Extension.getInstance().setState(key, data, "workspace");
  }

  private static async clear() {
    const ext = Extension.getInstance();

    await ext.setState(ExtensionState.Dashboard.Pages.Cache, undefined, "workspace");
    await ext.setState(ExtensionState.Dashboard.Pages.Index, undefined, "workspace");
    await ext.setState(ExtensionState.Settings.Extends, undefined, "workspace");

    Notifications.info("Cache cleared");
  }
}