import { window } from "vscode";
import { EXTENSION_NAME } from "../constants";


export class Notifications {

  public static info(message: string) {
    window.showInformationMessage(`${EXTENSION_NAME}: ${message}`);
  }

  public static warning(message: string) {
    window.showWarningMessage(`${EXTENSION_NAME}: ${message}`);
  }

  public static error(message: string) {
    window.showErrorMessage(`${EXTENSION_NAME}: ${message}`);
  }
}