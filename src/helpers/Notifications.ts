import { window } from "vscode";
import { EXTENSION_NAME } from "../constants";


export class Notifications {

  public static info(message: string, items?: any): Thenable<string> {
    return window.showInformationMessage(`${EXTENSION_NAME}: ${message}`, items);
  }

  public static warning(message: string, items?: any): Thenable<string> {
    return window.showWarningMessage(`${EXTENSION_NAME}: ${message}`, items);
  }

  public static error(message: string, items?: any): Thenable<string> {
    return window.showErrorMessage(`${EXTENSION_NAME}: ${message}`, items);
  }
}