import { window } from "vscode";
import { Logger } from ".";
import { EXTENSION_NAME } from "../constants";


export class Notifications {

  public static info(message: string, items?: any): Thenable<string> {
    Logger.info(`${EXTENSION_NAME}: ${message}`, "INFO");
    return window.showInformationMessage(`${EXTENSION_NAME}: ${message}`, items);
  }

  public static warning(message: string, items?: any): Thenable<string> {
    Logger.info(`${EXTENSION_NAME}: ${message}`, "WARNING");
    return window.showWarningMessage(`${EXTENSION_NAME}: ${message}`, items);
  }

  public static error(message: string, items?: any): Thenable<string> {
    Logger.info(`${EXTENSION_NAME}: ${message}`, "ERROR");
    return window.showErrorMessage(`${EXTENSION_NAME}: ${message}`, items);
  }
}