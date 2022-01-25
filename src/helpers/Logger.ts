import { Extension } from './Extension';
import { OutputChannel, window } from 'vscode';
import { format } from 'date-fns';

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

  public static info(message: string, type: "INFO" | "WARNING" | "ERROR" = "INFO"): void {
    if (!Logger.channel) {
      Logger.getInstance();
    }

    Logger.channel?.appendLine(`["${type}" - ${format(new Date(), "HH:MM:ss")}]  ${message}`);
  }

  public static warning(message: string): void {
    Logger.info(message, "WARNING");
  }

  public static error(message: string): void {
    Logger.info(message, "ERROR");
  }
}