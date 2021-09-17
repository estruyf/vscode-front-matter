import { DashboardMessage } from '../dashboardWebView/DashboardMessage';
import { CommandToCode } from "../panelWebView/CommandToCode";


interface ClientVsCode<T> {
  getState: () => T;
  setState: (data: T) => void;
  postMessage: (msg: unknown) => void;
}

declare const acquireVsCodeApi: <T = unknown>() => ClientVsCode<T>;

export class MessageHelper {
  private static vscode: ClientVsCode<any>;
  
  public static getVsCodeAPI() {
    MessageHelper.vscode = acquireVsCodeApi();
    return MessageHelper.vscode;
  }
  
  public static sendMessage = (command: CommandToCode | DashboardMessage, data?: any) => {    
    if (data) {
      MessageHelper.vscode.postMessage({ command, data });
    } else {
      MessageHelper.vscode.postMessage({ command });
    }
  }
}