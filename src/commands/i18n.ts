import { Uri, commands, window, workspace } from 'vscode';
import {
  ArticleHelper,
  ContentType,
  Extension,
  FrameworkDetector,
  Notifications,
  Settings,
  openFileInEditor,
  parseWinPath
} from '../helpers';
import { COMMAND_NAME, SETTING_CONTENT_I18N } from '../constants';
import { ContentFolder, Field, I18nConfig, ContentType as IContentType } from '../models';
import { join, parse } from 'path';
import { existsAsync } from '../utils';
import { Folders } from '.';
import { ParsedFrontMatter } from '../parsers';
import { PagesListener } from '../listeners/dashboard';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';

// TODO:
// Allow sponsors to automatically translate the content
// Support page bundles
// Filter on locale ✅
// Locale settings on the page folder level and global level
// Show the i18n content -> if default locale is in subfolder, the other content is not found ✅
// Update the page folder setting to include the locales property (use #ref) ✅
// Update the default card item when the translation is removed ✅
// Add action to create new translation ✅
// Trigger page update when translation is created ✅
// Add translations to the menu ✅
// Localization of the React components ✅

export class i18n {
  /**
   * Registers the i18n commands.
   */
  public static register() {
    const subscriptions = Extension.getInstance().subscriptions;

    subscriptions.push(commands.registerCommand(COMMAND_NAME.i18n.create, i18n.create));
  }

  /**
   * Retrieves the I18nConfig settings from the application.
   * @returns An array of I18nConfig objects if settings are found, otherwise undefined.
   */
  public static async getSettings(filePath: string): Promise<I18nConfig[] | undefined> {
    if (!filePath) {
      return;
    }

    const i18nSettings = Settings.get<I18nConfig[]>(SETTING_CONTENT_I18N);
    let pageFolder = Folders.getPageFolderByFilePath(filePath);
    if (!pageFolder) {
      const folders = Folders.get();

      const localeFolders = folders?.filter((folder) => folder.defaultLocale);
      if (!localeFolders) {
        return;
      }

      const fileName = parse(filePath).base;
      for (const folder of localeFolders) {
        const defaultFile = join(folder.path, fileName);
        if (await existsAsync(defaultFile)) {
          pageFolder = folder;
          break;
        }
      }
    }

    if (!pageFolder || !pageFolder.locales) {
      return i18nSettings;
    }

    return pageFolder.locales;
  }

  /**
   * Checks if the given file path corresponds to the default language.
   * @param filePath - The file path to check.
   * @returns True if the file path corresponds to the default language, false otherwise.
   */
  public static async isDefaultLanguage(filePath: string): Promise<boolean> {
    const i18nSettings = await i18n.getSettings(filePath);
    if (!i18nSettings) {
      return false;
    }

    const pageFolder = Folders.getPageFolderByFilePath(filePath);
    if (!pageFolder || !pageFolder.defaultLocale) {
      return false;
    }

    const fileInfo = parse(filePath);
    const dir = fileInfo.dir;

    if (pageFolder.path) {
      return parseWinPath(dir).toLowerCase() === parseWinPath(pageFolder.path).toLowerCase();
    }

    return false;
  }

  /**
   * Retrieves the I18nConfig for a given file path.
   * @param filePath - The path of the file.
   * @returns The I18nConfig object if found, otherwise undefined.
   */
  public static async getLocale(filePath: string): Promise<I18nConfig | undefined> {
    const i18nSettings = await i18n.getSettings(filePath);
    if (!i18nSettings) {
      return;
    }

    const pageFolder = Folders.getPageFolderByFilePath(filePath);
    const fileInfo = parse(filePath);
    if (pageFolder && pageFolder.defaultLocale) {
      if (
        pageFolder.path &&
        parseWinPath(fileInfo.dir).toLowerCase() === parseWinPath(pageFolder.path).toLowerCase()
      ) {
        return i18nSettings.find((i18n) => i18n.locale === pageFolder.defaultLocale);
      }
    }

    const folders = Folders.get();
    if (!folders) {
      return;
    }

    const fileName = fileInfo.base;
    const defaultLanguageFolders = folders.filter((folder) => folder.defaultLocale);
    for (const folder of defaultLanguageFolders) {
      for (const locale of i18nSettings) {
        if (locale.path && folder.defaultLocale !== locale.locale) {
          const translation = join(folder.path, locale.path, fileName);
          if (parseWinPath(translation).toLowerCase() === parseWinPath(filePath).toLowerCase()) {
            return locale;
          }
        }
      }
    }

    return;
  }

  /**
   * Retrieves translations for a given file path.
   * @param filePath - The path of the file for which translations are requested.
   * @returns A promise that resolves to an object containing translations for each locale, or undefined if i18n settings are not available.
   */
  public static async getTranslations(filePath: string): Promise<
    | {
        [locale: string]: {
          locale: I18nConfig;
          path: string;
        };
      }
    | undefined
  > {
    const i18nSettings = await i18n.getSettings(filePath);
    if (!i18nSettings) {
      return;
    }

    const translations: {
      [locale: string]: {
        locale: I18nConfig;
        path: string;
      };
    } = {};

    const pageFolder = Folders.getPageFolderByFilePath(filePath);
    const fileName = parse(filePath).base;
    if (pageFolder && pageFolder.defaultLocale) {
      for (const i18n of i18nSettings) {
        const translation = join(pageFolder.path, i18n.path || '', fileName);
        if (await existsAsync(translation)) {
          translations[i18n.locale] = {
            locale: i18n,
            path: translation
          };
        }
      }
      return translations;
    }

    const folders = Folders.get();
    if (!folders) {
      return;
    }

    const defaultLanguageFolders = folders.filter((folder) => folder.defaultLocale);
    let defaultLanguageFolder: ContentFolder | undefined;
    for (const folder of defaultLanguageFolders) {
      const defaultFile = join(folder.path, fileName);
      if (await existsAsync(defaultFile)) {
        defaultLanguageFolder = folder;
        break;
      }
    }

    if (!defaultLanguageFolder) {
      return translations;
    }

    for (const i18n of i18nSettings) {
      const translation = join(defaultLanguageFolder.path, i18n.path || '', fileName);
      if (await existsAsync(translation)) {
        translations[i18n.locale] = {
          locale: i18n,
          path: translation
        };
      }
    }

    return translations;
  }

  /**
   * Creates a new content file for a specific locale based on the i18n configuration.
   * If a file path is provided, the new content file will be created in the same directory.
   * If no file path is provided, the active file in the editor will be used.
   * @param filePath The path of the file where the new content file should be created.
   */
  private static async create(fileUri?: Uri | string) {
    if (!fileUri) {
      const filePath = ArticleHelper.getActiveFile();
      fileUri = filePath ? Uri.file(filePath) : undefined;
    }

    if (!fileUri) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateWarningNoFileSelected));
      return;
    }

    if (typeof fileUri === 'string') {
      fileUri = Uri.file(fileUri);
    }

    const i18nSettings = await i18n.getSettings(fileUri.fsPath);
    if (!i18nSettings) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateWarningNoConfig));
      return;
    }

    const isDefaultLanguage = await i18n.isDefaultLanguage(fileUri.fsPath);
    if (!isDefaultLanguage) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateWarningNotDefaultLocale));
      return;
    }

    const locale = await window.showQuickPick(
      i18nSettings.filter((i18n) => i18n.path).map((i18n) => i18n.title || i18n.locale),
      {
        title: l10n.t(LocalizationKey.commandsI18nCreateQuickPickTitle),
        placeHolder: l10n.t(LocalizationKey.commandsI18nCreateQuickPickPlaceHolder),
        ignoreFocusOut: true
      }
    );

    if (!locale) {
      return;
    }

    const selectedI18n = i18nSettings.find(
      (i18n) => i18n.title === locale || i18n.locale === locale
    );
    if (!selectedI18n || !selectedI18n.path) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateWarningNoConfig));
      return;
    }

    let article = await ArticleHelper.getFrontMatterByPath(fileUri.fsPath);
    if (!article) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateWarningNoFile));
      return;
    }

    const contentType = ArticleHelper.getContentType(article);
    if (!contentType) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateWarningNoContentType));
      return;
    }

    // Get the directory of the file
    const fileInfo = parse(fileUri.fsPath);
    const i18nDir = join(fileInfo.dir, selectedI18n.path);

    if (!(await existsAsync(i18nDir))) {
      await workspace.fs.createDirectory(Uri.file(i18nDir));
    }

    article = await i18n.updateFrontMatter(
      article,
      fileUri.fsPath,
      contentType,
      selectedI18n,
      i18nDir
    );

    const newFilePath = join(i18nDir, fileInfo.base);
    if (await existsAsync(newFilePath)) {
      Notifications.error(l10n.t(LocalizationKey.commandsI18nCreateErrorFileExists));
      return;
    }

    const newFileUri = Uri.file(newFilePath);
    await workspace.fs.writeFile(
      newFileUri,
      Buffer.from(ArticleHelper.stringifyFrontMatter(article.content, article.data))
    );

    await openFileInEditor(newFilePath);

    PagesListener.refresh();

    Notifications.info(
      l10n.t(
        LocalizationKey.commandsI18nCreateSuccessCreated,
        selectedI18n.title || selectedI18n.locale
      )
    );
  }

  /**
   * Updates the front matter of an article with internationalization (i18n) support.
   *
   * @param article - The parsed front matter of the article.
   * @param filePath - The path of the file containing the front matter.
   * @param contentType - The content type of the article.
   * @param i18nConfig - The configuration for internationalization.
   * @param i18nDir - The directory where the i18n files are located.
   * @returns A Promise that resolves to the updated parsed front matter.
   */
  private static async updateFrontMatter(
    article: ParsedFrontMatter,
    filePath: string,
    contentType: IContentType,
    i18nConfig: I18nConfig,
    i18nDir: string
  ): Promise<ParsedFrontMatter> {
    const imageFields = ContentType.findFieldsByTypeDeep(contentType.fields, 'image');
    if (imageFields.length > 0) {
      article.data = await i18n.processImageFields(article.data, filePath, imageFields, i18nDir);
    }

    return article;
  }

  /**
   * Processes the image fields in the provided data object.
   * Replaces the image field values with the relative path to the image file.
   *
   * @param data - The data object containing the field values.
   * @param filePath - The absolute file path of the data object.
   * @param fields - The array of field arrays to process.
   * @param i18nDir - The directory path for internationalization.
   * @returns The updated data object with image field values replaced by relative paths.
   */
  private static async processImageFields(
    data: { [key: string]: any },
    filePath: string,
    fields: Field[][],
    i18nDir: string
  ) {
    for (const field of fields) {
      if (!field) {
        continue;
      }

      for (const f of field) {
        if (f.type === 'image') {
          const value = data[f.name];
          if (value) {
            let imgPath = FrameworkDetector.getAbsPathByFile(value, filePath);
            imgPath = FrameworkDetector.getRelPathByFileDir(imgPath, i18nDir);
            data[f.name] = imgPath;
          }
        }
      }
    }

    return data;
  }
}
