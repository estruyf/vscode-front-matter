import { SETTING_GLOBAL_NOTIFICATIONS_DISABLED } from './../constants/settings';
import { window } from 'vscode';
import { COMMAND_NAME, EXTENSION_NAME, SETTING_GLOBAL_NOTIFICATIONS } from '../constants';
import { Logger } from './Logger';
import { Settings } from './SettingsHelper';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';

type NotificationType = 'INFO' | 'WARNING' | 'ERROR' | 'ERROR_ONCE';

export class Notifications {
  private static notifications: string[] = [];

  /**
   * Show a notification to the user
   * @param message
   * @param items
   * @returns
   */
  public static info(message: string, ...items: any): Thenable<string | undefined> {
    Logger.info(`${EXTENSION_NAME}: ${message}`, 'VSCODE', 'INFO');

    if (this.shouldShow('INFO')) {
      return window.showInformationMessage(`${EXTENSION_NAME}: ${message}`, ...items);
    }

    return Promise.resolve(undefined);
  }

  /**
   * Show a warning notification to the user
   * @param message
   * @param items
   * @returns
   */
  public static warning(message: string, ...items: any): Thenable<string | undefined> {
    Logger.info(`${EXTENSION_NAME}: ${message}`, 'VSCODE', 'WARNING');

    if (this.shouldShow('WARNING')) {
      return window.showWarningMessage(`${EXTENSION_NAME}: ${message}`, ...items);
    }

    return Promise.resolve(undefined);
  }

  /**
   * Show a warning notification to the user with a link to the output channel
   * @param message
   * @param items
   * @returns
   */
  public static warningWithOutput(message: string, ...items: any): Thenable<string | undefined> {
    Logger.info(`${EXTENSION_NAME}: ${message}`, 'VSCODE', 'WARNING');

    if (this.shouldShow('WARNING')) {
      return window.showWarningMessage(
        `${EXTENSION_NAME}: ${message} ${l10n.t(
          LocalizationKey.notificationsOutputChannelDescription,
          `[${l10n.t(LocalizationKey.notificationsOutputChannelLink)}](command:${
            COMMAND_NAME.showOutputChannel
          })`
        )}`,
        ...items
      );
    }

    return Promise.resolve(undefined);
  }

  /**
   * Show an error notification to the user
   * @param message
   * @param items
   * @returns
   */
  public static error(message: string, ...items: any): Thenable<string | undefined> {
    Logger.info(`${EXTENSION_NAME}: ${message}`, 'VSCODE', 'ERROR');

    if (this.shouldShow('ERROR')) {
      return window.showErrorMessage(`${EXTENSION_NAME}: ${message}`, ...items);
    }

    return Promise.resolve(undefined);
  }

  /**
   * Show an error notification to the user with a link to the output channel
   * @param message
   * @param items
   * @returns
   */
  public static errorWithOutput(message: string, ...items: any): Thenable<string | undefined> {
    Logger.info(`${EXTENSION_NAME}: ${message}`, 'VSCODE', 'ERROR');

    if (this.shouldShow('ERROR')) {
      return window.showErrorMessage(
        `${EXTENSION_NAME}: ${message} ${l10n.t(
          LocalizationKey.notificationsOutputChannelDescription,
          `[${l10n.t(LocalizationKey.notificationsOutputChannelLink)}](command:${
            COMMAND_NAME.showOutputChannel
          })`
        )}`,
        ...items
      );
    }

    return Promise.resolve(undefined);
  }

  /**
   * Show an error notification to the user only once
   * @param message
   * @param items
   * @returns
   */
  public static async errorShowOnce(message: string, ...items: any): Promise<string | undefined> {
    if (this.notifications.includes(message)) {
      return;
    }

    this.notifications.push(message);

    return this.error(message, ...items);
  }

  /**
   * Show the notification if not disabled
   * @param type
   * @param notificationType
   * @param message
   * @param items
   * @returns
   */
  public static async showIfNotDisabled(
    type: string,
    notificationType: NotificationType,
    message: string,
    ...items: any
  ): Promise<string | undefined> {
    const disabledTypes = Settings.get<string[]>(SETTING_GLOBAL_NOTIFICATIONS_DISABLED);

    if (disabledTypes && disabledTypes.includes(type)) {
      return;
    }

    switch (notificationType) {
      case 'WARNING':
        return await Notifications.warning(message, ...items);
      case 'ERROR':
        return await Notifications.error(message, ...items);
      case 'ERROR_ONCE':
        return await Notifications.errorShowOnce(message, ...items);
      case 'INFO':
      default:
        return await Notifications.info(message, ...items);
    }
  }

  /**
   * Check if the notification should be shown
   * @param level
   * @returns
   */
  private static shouldShow(level: NotificationType): boolean {
    let levels = Settings.get<string[]>(SETTING_GLOBAL_NOTIFICATIONS);

    if (!levels) {
      return true;
    }

    if (levels.map((l) => l.toLowerCase()).includes(level.toLowerCase())) {
      return true;
    }

    return false;
  }
}
