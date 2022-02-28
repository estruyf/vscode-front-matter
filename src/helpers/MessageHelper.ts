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
    if (!MessageHelper.vscode) {
      MessageHelper.vscode = acquireVsCodeApi();
    }
    return MessageHelper.vscode;
  }
  
  public static sendMessage = (command: CommandToCode | DashboardMessage, data?: any) => {    
    const vscode = MessageHelper.getVsCodeAPI();
    if (data) {
      vscode.postMessage({ command, data });
    } else {
      vscode.postMessage({ command });
    }
  }

  public static getState = () => {    
    const vscode = MessageHelper.getVsCodeAPI();
    return vscode.getState();
  }

  public static setState = (data: any) => {    
    const vscode = MessageHelper.getVsCodeAPI();
    vscode.setState({
      ...data
    });
  }
}