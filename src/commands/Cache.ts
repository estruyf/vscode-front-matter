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

  private static async clear() {
    const ext = Extension.getInstance();

    await ext.setState(ExtensionState.Dashboard.Pages.Cache, undefined, "workspace");
    await ext.setState(ExtensionState.Dashboard.Pages.Index, undefined, "workspace");

    Notifications.info("Cache cleared");
  }
}