import { window } from "vscode";
import { EXTENSION_NAME, SETTING_GLOBAL_NOTIFICATIONS } from "../constants";
import { Logger } from "./Logger";
import { Settings } from "./SettingsHelper";


export class Notifications {

  public static info(message: string, ...items: any): Thenable<string | undefined> {
    Logger.info(`${EXTENSION_NAME}: ${message}`, "INFO");

    if (this.shouldShow("INFO")) {
      return window.showInformationMessage(`${EXTENSION_NAME}: ${message}`, ...items);
    }

    return Promise.resolve(undefined);
  }

  public static warning(message: string, ...items: any): Thenable<string | undefined> {
    Logger.info(`${EXTENSION_NAME}: ${message}`, "WARNING");

    if (this.shouldShow("WARNING")) {
      return window.showWarningMessage(`${EXTENSION_NAME}: ${message}`, ...items);
    }

    return Promise.resolve(undefined);
  }

  public static error(message: string, ...items: any): Thenable<string | undefined> {
    Logger.info(`${EXTENSION_NAME}: ${message}`, "ERROR");

    if (this.shouldShow("ERROR")) {
      return window.showErrorMessage(`${EXTENSION_NAME}: ${message}`, ...items);
    }

    return Promise.resolve(undefined);
  }

  private static shouldShow(level: "INFO" | "WARNING" | "ERROR"): boolean {
    let levels = Settings.get<string[]>(SETTING_GLOBAL_NOTIFICATIONS);

    if (!levels) {
      return true;
    }

    if (levels.map(l => l.toLowerCase()).includes(level.toLowerCase())) {
      return true;
    }

    return false;
  }
}