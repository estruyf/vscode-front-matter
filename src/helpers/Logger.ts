import { Extension } from './Extension';
import { commands, OutputChannel, window } from 'vscode';
import { format } from 'date-fns';
import { COMMAND_NAME, SETTING_LOGGING } from '../constants';
import { Settings } from '.';

export type LoggerLocation = 'VSCODE' | 'DASHBOARD' | 'PANEL';

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

  public static getLevel(): string {
    return Settings.get(SETTING_LOGGING) || 'info';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public static info(
    message: string,
    location: LoggerLocation = 'VSCODE',
    type: 'VERBOSE' | 'INFO' | 'WARNING' | 'ERROR' = 'INFO'
  ): void {
    if (!Logger.channel) {
      Logger.getInstance();
    }

    const loggingLevel = Logger.getLevel();

    const logMessage = `["${type}" - ${format(new Date(), 'HH:mm:ss')}] ${location} | ${message}`;

    if (loggingLevel === 'verbose') {
      Logger.log(logMessage);
    } else if (loggingLevel === 'info' && type !== 'VERBOSE') {
      Logger.log(logMessage);
    } else if (loggingLevel === 'warning' && (type === 'WARNING' || type === 'ERROR')) {
      Logger.log(logMessage);
    } else if (loggingLevel === 'error' && type === 'ERROR') {
      Logger.log(logMessage);
    }
  }

  public static warning(message: string, location: LoggerLocation = 'VSCODE'): void {
    Logger.info(message, location, 'WARNING');
  }

  public static error(message: string, location: LoggerLocation = 'VSCODE'): void {
    Logger.info(message, location, 'ERROR');
  }

  public static verbose(message: string, location: LoggerLocation = 'VSCODE'): void {
    Logger.info(message, location, 'VERBOSE');
  }

  private static log(message: string) {
    Logger.channel?.appendLine(message);
  }
}
