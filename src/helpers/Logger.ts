import { Extension } from './Extension';
import { OutputChannel, window } from 'vscode';

export class Logger {
  private static instance: Logger;
  private static channel: OutputChannel | null = null; 

  private constructor() {
    const title = Extension.getInstance().title;
    Logger.channel = window.createOutputChannel(title);
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public static info(message: string): void {
    if (!Logger.channel) {
      Logger.getInstance();
    }

    Logger.channel?.appendLine(message);
  }
}