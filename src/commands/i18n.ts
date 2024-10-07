import {
  ProgressLocation,
  QuickPickItem,
  QuickPickItemKind,
  QuickPickOptions,
  ThemeIcon,
  Uri,
  commands,
  window,
  workspace
} from 'vscode';
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
import { existsAsync, getDescriptionField, getTitleField } from '../utils';
import { Folders } from '.';
import { ParsedFrontMatter } from '../parsers';
import { PagesListener } from '../listeners/dashboard';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';
import { Translations } from '../services/Translations';

export class i18n {
  private static processedFiles: {
    [filePath: string]: { dir: string; filename: string; isPageBundle: boolean };
  } = {};

  /**
   * Registers the i18n commands.
   */
  public static register() {
    const subscriptions = Extension.getInstance().subscriptions;

    subscriptions.push(commands.registerCommand(COMMAND_NAME.i18n.create, i18n.create));
    subscriptions.push(commands.registerCommand(COMMAND_NAME.i18n.createOrOpen, i18n.createOrOpen));

    i18n.clearFiles();
  }

  /**
   * Clear the processed files
   */
  public static clearFiles() {
    i18n.processedFiles = {};
  }

  /**
   * Retrieves all the I18nConfig settings.
   *
   * @returns An array of I18nConfig settings.
   */
  public static async getAll() {
    const i18nSettings = Settings.get<I18nConfig[]>(SETTING_CONTENT_I18N) || [];

    const folders = await Folders.get();
    if (folders) {
      for (const folder of folders) {
        if (folder.locales) {
          for (const locale of folder.locales) {
            if (!i18nSettings.some((i18n) => i18n.locale === locale.locale)) {
              i18nSettings.push(locale);
            }
          }
        }
      }
    }

    return i18nSettings;
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
    let pageFolder = await Folders.getPageFolderByFilePath(filePath);
    if (!pageFolder) {
      pageFolder = await i18n.getPageFolder(filePath);
    }

    if (!pageFolder || !pageFolder.locales) {
      return i18nSettings;
    }

    return pageFolder.locales;
  }

  /**
   * Checks if the locale is enabled for the given file path.
   * @param filePath - The file path to check.
   * @returns A promise that resolves to a boolean indicating whether the locale is enabled or not.
   */
  public static async isLocaleEnabled(filePath: string): Promise<boolean> {
    const i18nSettings = await i18n.getSettings(filePath);
    if (!i18nSettings) {
      return false;
    }

    const pageFolder = await Folders.getPageFolderByFilePath(filePath);
    if (!pageFolder || !pageFolder.locale) {
      return false;
    }

    return i18nSettings.some((i18n) => i18n.locale === pageFolder.locale);
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

    const pageFolder = await Folders.getPageFolderByFilePath(filePath);
    if (!pageFolder || !pageFolder.defaultLocale) {
      return false;
    }

    const fileInfo = await i18n.getFileInfo(filePath);

    if (pageFolder.path) {
      if (pageFolder.locale) {
        return pageFolder.locale === pageFolder.defaultLocale;
      }

      let pageFolderPath = parseWinPath(pageFolder.path);
      if (!pageFolderPath.endsWith('/')) {
        pageFolderPath += '/';
      }

      return (
        parseWinPath(fileInfo.dir).toLowerCase() === parseWinPath(pageFolderPath).toLowerCase()
      );
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

    let pageFolder = await Folders.getPageFolderByFilePath(filePath);

    const fileInfo = await i18n.getFileInfo(filePath);

    if (pageFolder && pageFolder.defaultLocale) {
      let pageFolderPath = parseWinPath(pageFolder.path);
      if (!pageFolderPath.endsWith('/')) {
        pageFolderPath += '/';
      }

      if (
        pageFolder.path &&
        pageFolder.locale &&
        parseWinPath(fileInfo.dir).toLowerCase() === parseWinPath(pageFolderPath).toLowerCase()
      ) {
        return i18nSettings.find((i18n) => i18n.locale === pageFolder?.locale);
      }
    }

    pageFolder = await i18n.getPageFolder(filePath);
    if (!pageFolder) {
      return;
    }

    for (const locale of i18nSettings) {
      if (locale.path && pageFolder.defaultLocale !== locale.locale) {
        const translation = join(pageFolder.path, locale.path, fileInfo.filename);
        if (parseWinPath(translation).toLowerCase() === parseWinPath(filePath).toLowerCase()) {
          return locale;
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

    let pageFolder = await Folders.getPageFolderByFilePath(filePath);
    const fileInfo = await i18n.getFileInfo(filePath);

    if (pageFolder && pageFolder.defaultLocale && pageFolder.localeSourcePath) {
      for (const i18n of i18nSettings) {
        const translation = join(pageFolder.localeSourcePath, i18n.path || '', fileInfo.filename);
        if (await existsAsync(translation)) {
          translations[i18n.locale] = {
            locale: i18n,
            path: translation
          };
        }
      }
      return translations;
    }

    pageFolder = await i18n.getPageFolder(filePath);
    if (!pageFolder) {
      return translations;
    }

    for (const i18n of i18nSettings) {
      const translation = join(pageFolder.path, i18n.path || '', fileInfo.filename);
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

    const pageFolder = await Folders.getPageFolderByFilePath(fileUri.fsPath);
    if (!pageFolder || !pageFolder.localeSourcePath) {
      Notifications.error(l10n.t(LocalizationKey.commandsI18nCreateErrorNoContentFolder));
      return;
    }

    const i18nSettings = await i18n.getSettings(fileUri.fsPath);
    if (!i18nSettings) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateWarningNoConfig));
      return;
    }

    const sourceLocale = await i18n.getLocale(fileUri.fsPath);
    if (!sourceLocale || !sourceLocale.locale) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateErrorNoLocaleDefinition));
      return;
    }

    const translations = (await i18n.getTranslations(fileUri.fsPath)) || {};
    const targetLocales = i18nSettings.filter((i18nSetting) => {
      return (
        i18nSetting.path &&
        i18nSetting.locale !== sourceLocale.locale &&
        !translations[i18nSetting.locale]
      );
    });

    if (targetLocales.length === 0) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateErrorNoLocales));
      return;
    }

    const locale = await window.showQuickPick(
      targetLocales.map((i18n) => i18n.title || i18n.locale),
      {
        title: l10n.t(LocalizationKey.commandsI18nCreateQuickPickTitle),
        placeHolder: l10n.t(LocalizationKey.commandsI18nCreateQuickPickPlaceHolder),
        ignoreFocusOut: true
      }
    );

    if (!locale) {
      return;
    }

    const targetLocale = i18nSettings.find(
      (i18n) => i18n.title === locale || i18n.locale === locale
    );
    if (!targetLocale || !targetLocale.path) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateWarningNoConfig));
      return;
    }

    let article = await ArticleHelper.getFrontMatterByPath(fileUri.fsPath);
    if (!article) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateWarningNoFile));
      return;
    }

    const contentType = await ArticleHelper.getContentType(article);
    if (!contentType) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateWarningNoContentType));
      return;
    }

    // Get the directory of the file
    const fileInfo = parse(fileUri.fsPath);
    let dir = fileInfo.dir;
    let pageBundleDir = '';

    if (await ArticleHelper.isPageBundle(fileUri.fsPath)) {
      dir = ArticleHelper.getPageFolderFromBundlePath(fileUri.fsPath);
      pageBundleDir = fileUri.fsPath.replace(dir, '');
      pageBundleDir = join(parse(pageBundleDir).dir);
    }

    const i18nDir = join(pageFolder.localeSourcePath, targetLocale.path, pageBundleDir);

    if (!(await existsAsync(i18nDir))) {
      await workspace.fs.createDirectory(Uri.file(i18nDir));
    }

    article = await i18n.updateFrontMatter(
      article,
      fileUri.fsPath,
      contentType,
      sourceLocale,
      targetLocale,
      i18nDir
    );

    const newFilePath = join(i18nDir, fileInfo.base);
    if (await existsAsync(newFilePath)) {
      Notifications.error(l10n.t(LocalizationKey.commandsI18nCreateErrorFileExists));
      return;
    }

    if (sourceLocale?.locale) {
      article = await i18n.translate(article, sourceLocale, targetLocale);
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
        sourceLocale.title || sourceLocale.locale
      )
    );
  }

  /**
   * This method handles the process of creating a new translation file if it doesn't exist,
   * or opening an existing translation file if it's already present.
   * @param filePath The path of the file where the new content file should be created or being switched to. Behaves like `create` if not provided.
   */
  private static async createOrOpen(fileUri?: Uri | string) {
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

    const pageFolder = await Folders.getPageFolderByFilePath(fileUri.fsPath);
    if (!pageFolder || !pageFolder.localeSourcePath) {
      Notifications.error(l10n.t(LocalizationKey.commandsI18nCreateErrorNoContentFolder));
      return;
    }

    let article = await ArticleHelper.getFrontMatterByPath(fileUri.fsPath);
    if (!article) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateWarningNoFile));
      return;
    }

    const contentType = await ArticleHelper.getContentType(article);
    if (!contentType) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateWarningNoContentType));
      return;
    }

    const i18nSettings = await i18n.getSettings(fileUri.fsPath);
    if (!i18nSettings) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateWarningNoConfig));
      return;
    }

    const sourceLocale = await i18n.getLocale(fileUri.fsPath);
    if (!sourceLocale || !sourceLocale.locale) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateErrorNoLocaleDefinition));
      return;
    }

    // Determine translation file paths
    const fileInfo = parse(fileUri.fsPath);
    let pageBundleDir = '';
    if (await ArticleHelper.isPageBundle(fileUri.fsPath)) {
      const dir = ArticleHelper.getPageFolderFromBundlePath(fileUri.fsPath);
      pageBundleDir = fileUri.fsPath.replace(dir, '');
      pageBundleDir = join(parse(pageBundleDir).dir);
    }

    // Gather target locales & metadata
    const translations = (await i18n.getTranslations(fileUri.fsPath)) || {};
    const targetLocales = i18nSettings
      .filter((i18n) => {
        return i18n.path && i18n.locale !== sourceLocale.locale;
      })
      .map((i18n) => {
        return {
          ...i18n,
          dir: join(pageFolder.localeSourcePath!, i18n.path!, pageBundleDir),
          absolutePath: join(
            pageFolder.localeSourcePath!,
            i18n.path!,
            pageBundleDir,
            fileInfo.base
          ),
          relativePath: join(i18n.path!, pageBundleDir, fileInfo.base)
        };
      })
      .sort((a, b) => (a.title || a.locale).localeCompare(b.title || b.locale));

    if (targetLocales.length === 0) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateErrorNoLocales));
      return;
    }

    // Configure quick pick items & options
    const existingTargetLocales = targetLocales.filter((i18n) => translations[i18n.locale]);
    const newTargetLocales = targetLocales.filter((i18n) => !translations[i18n.locale]);
    const quickPickItems: QuickPickItem[] = [
      ...(existingTargetLocales.length
        ? [
            {
              label: l10n.t(LocalizationKey.commandsI18nCreateOrOpenQuickPickCategoryExisting),
              kind: QuickPickItemKind.Separator
            },
            ...existingTargetLocales.map((i18n) => ({
              label: i18n.title || i18n.locale,
              detail: l10n.t(LocalizationKey.commandsI18nCreateOrOpenQuickPickActionOpen, i18n.relativePath)
            }))
          ]
        : []),
      ...(newTargetLocales.length
        ? [
            {
              label: l10n.t(LocalizationKey.commandsI18nCreateOrOpenQuickPickCategoryNew),
              kind: QuickPickItemKind.Separator
            },
            ...newTargetLocales.map((i18n) => ({
              label: i18n.title || i18n.locale,
              detail: `$(file-add) ${l10n.t(LocalizationKey.commandsI18nCreateOrOpenQuickPickActionCreate, i18n.relativePath)}`
            }))
          ]
        : [])
    ];
    const quickPickOptions: QuickPickOptions = {
      title: l10n.t(LocalizationKey.commandsI18nCreateOrOpenQuickPickTitle),
      ignoreFocusOut: true,
      matchOnDetail: true
    };

    const localeItem = await window.showQuickPick<QuickPickItem>(quickPickItems, quickPickOptions);
    const locale = localeItem?.label;
    if (!locale) {
      return;
    }

    const targetLocale = targetLocales.find(
      (i18n) => i18n.title === locale || i18n.locale === locale
    );
    if (!targetLocale || !targetLocale.path) {
      Notifications.warning(l10n.t(LocalizationKey.commandsI18nCreateWarningNoConfig));
      return;
    }

    // If it exists, open the translation file
    if (await existsAsync(targetLocale.absolutePath)) {
      await openFileInEditor(targetLocale.absolutePath);
      return;
    }

    // If it doesn't exist, create the new translation file & update front matter
    if (!(await existsAsync(targetLocale.dir))) {
      await workspace.fs.createDirectory(Uri.file(targetLocale.dir));
    }

    article = await i18n.updateFrontMatter(
      article,
      fileUri.fsPath,
      contentType,
      sourceLocale,
      targetLocale,
      targetLocale.dir
    );
    if (sourceLocale?.locale) {
      article = await i18n.translate(article, sourceLocale, targetLocale);
    }

    const newFileUri = Uri.file(targetLocale.absolutePath);
    await workspace.fs.writeFile(
      newFileUri,
      Buffer.from(ArticleHelper.stringifyFrontMatter(article.content, article.data))
    );

    await openFileInEditor(targetLocale.absolutePath);

    PagesListener.refresh();

    Notifications.info(
      l10n.t(
        LocalizationKey.commandsI18nCreateSuccessCreated,
        sourceLocale.title || sourceLocale.locale
      )
    );
  }

  /**
   * Translates the given article from the source locale to the target locale using DeepL translation service.
   * @param article - The article to be translated.
   * @param sourceLocale - The source locale configuration.
   * @param targetLocale - The target locale configuration.
   * @returns A promise that resolves to the translated article.
   */
  private static async translate(
    article: ParsedFrontMatter,
    sourceLocale: I18nConfig,
    targetLocale: I18nConfig
  ) {
    return new Promise<ParsedFrontMatter>((resolve) => {
      window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: l10n.t(LocalizationKey.commandsI18nTranslateProgressTitle),
          cancellable: false
        },
        async () => {
          try {
            const titleField = getTitleField();
            const descriptionField = getDescriptionField();

            const title = article.data[titleField] || '';
            const description = article.data[descriptionField] || '';
            const content = article.content || '';

            const text = [title, description, content];
            const translations = await Translations.translate(
              text,
              sourceLocale.locale,
              targetLocale.locale
            );

            if (!translations || translations.length < 3) {
              resolve(article);
              return;
            }

            article.data[titleField] = article.data[titleField] ? translations[0] : '';
            article.data[descriptionField] = article.data[descriptionField] ? translations[1] : '';
            article.content = article.content ? translations[2] : '';
          } catch (error) {
            Notifications.error(`${(error as Error).message}`);
          }

          resolve(article);
        }
      );
    });
  }

  /**
   * Retrieves the filename and directory information from the given file path.
   * If the file is a page bundle, the directory will be adjusted accordingly.
   * @param filePath - The path of the file.
   * @returns An object containing the filename and directory.
   */
  private static async getFileInfo(filePath: string): Promise<{ filename: string; dir: string }> {
    if (i18n.processedFiles[filePath]) {
      return i18n.processedFiles[filePath];
    }

    const fileInfo = parse(filePath);
    let filename = fileInfo.base;
    let dir = fileInfo.dir;

    const isPageBundle = await ArticleHelper.isPageBundle(filePath);
    if (isPageBundle) {
      dir = ArticleHelper.getPageFolderFromBundlePath(filePath);
      filename = join(parseWinPath(filePath).replace(parseWinPath(dir), ''));
    }

    if (!dir.endsWith('/')) {
      dir += '/';
    }

    i18n.processedFiles[filePath] = {
      isPageBundle,
      filename,
      dir
    };

    return i18n.processedFiles[filePath];
  }

  /**
   * Retrieves the page folder for a given file path.
   *
   * @param filePath - The path of the file.
   * @returns A promise that resolves to the ContentFolder object representing the page folder, or undefined if not found.
   */
  private static async getPageFolder(filePath: string): Promise<ContentFolder | undefined> {
    const folders = await Folders.get();

    const localeFolders = folders?.filter((folder) => folder.defaultLocale);
    if (!localeFolders) {
      return;
    }

    const fileInfo = await i18n.getFileInfo(filePath);

    for (const folder of localeFolders) {
      const defaultFile = join(folder.path, fileInfo.filename);
      if (await existsAsync(defaultFile)) {
        return folder;
      }
    }
  }

  /**
   * Updates the front matter of an article with internationalization (i18n) support.
   *
   * @param article - The parsed front matter of the article.
   * @param filePath - The path of the file containing the front matter.
   * @param contentType - The content type of the article.
   * @param sourceLocale - The source locale.
   * @param targetLocale - The target locale.
   * @param i18nDir - The directory where the i18n files are located.
   * @returns A Promise that resolves to the updated parsed front matter.
   */
  private static async updateFrontMatter(
    article: ParsedFrontMatter,
    filePath: string,
    contentType: IContentType,
    sourceLocale: I18nConfig,
    targetLocale: I18nConfig,
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
