import { Extension } from './Extension';
import { commands, OutputChannel, window } from 'vscode';
import { format } from 'date-fns';
import { COMMAND_NAME } from '../constants';

export class Logger {
  private static instance: Logger;
  public static channel: OutputChannel | null = null;

  private constructor() {
    const displayName = Extension.getInstance().displayName;
    Logger.channel = window.createOutputChannel(displayName);
    commands.registerCommand(COMMAND_NAME.showOutputChannel, () => {
      Logger.channel?.show();
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public static info(message: string, type: 'INFO' | 'WARNING' | 'ERROR' = 'INFO'): void {
    if (!Logger.channel) {
      Logger.getInstance();
    }

    Logger.channel?.appendLine(`["${type}" - ${format(new Date(), 'HH:mm:ss')}]  ${message}`);
  }

  public static warning(message: string): void {
    Logger.info(message, 'WARNING');
  }

  public static error(message: string): void {
    Logger.info(message, 'ERROR');
  }
}
