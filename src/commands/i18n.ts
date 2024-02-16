import { commands, window } from 'vscode';
import { ArticleHelper, Extension, Notifications, Settings } from '../helpers';
import { COMMAND_NAME, SETTING_CONTENT_I18N } from '../constants';
import { I18nConfig } from '../models';

export class i18n {
  public static register() {
    const subscriptions = Extension.getInstance().subscriptions;

    subscriptions.push(commands.registerCommand(COMMAND_NAME.i18n.create, i18n.create));
  }

  public static getSettings(): I18nConfig[] | undefined {
    const i18nSettings = Settings.get<I18nConfig[]>(SETTING_CONTENT_I18N);

    if (!i18nSettings) {
      return;
    }

    return i18nSettings;
  }

  private static async create(filePath?: string) {
    const i18nSettings = i18n.getSettings();
    if (!i18nSettings) {
      Notifications.warning('No i18n configuration found');
      return;
    }

    if (!filePath) {
      filePath = ArticleHelper.getActiveFile();
    }

    if (!filePath) {
      Notifications.warning('No file selected');
      return;
    }

    const locale = await window.showQuickPick(
      i18nSettings.map((i18n) => i18n.title || i18n.locale),
      {
        title: 'Create content for locale',
        placeHolder: 'To which locale do you want to create a new content?',
        ignoreFocusOut: true
      }
    );

    if (!locale) {
      return;
    }

    const selectedI18n = i18nSettings.find(
      (i18n) => i18n.title === locale || i18n.locale === locale
    );
    if (!selectedI18n) {
      Notifications.warning('No i18n configuration found');
      return;
    }

    // TODO: start from a page, or use a path
    Notifications.info('Not implemented yet');
  }
}
