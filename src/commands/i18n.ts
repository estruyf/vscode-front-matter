import {
  ProgressLocation,
  QuickPickItem,
  QuickPickItemKind,
  QuickPickOptions,
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
import { COMMAND_NAME, SETTING_CONTENT_I18N, SETTING_TAXONOMY_FIELD_GROUPS } from '../constants';
import {
  ContentFolder,
  Field,
  FieldGroup,
  FieldType,
  I18nConfig,
  ContentType as IContentType
} from '../models';
import { join, parse } from 'path';
import { existsAsync, getDescriptionField, getTitleField } from '../utils';
import { Folders } from '.';
import { ParsedFrontMatter } from '../parsers';
import { PagesListener } from '../listeners/dashboard';
import { LocalizationKey, localize } from '../localization';
import { Translations } from '../services/Translations';

/**
 * Reference to a value which needs to be translated.
 */
interface TranslationValue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  container: any;
  key: string | number;
}

export class i18n {
  private static processedFiles: {
    [filePath: string]: { dir: string; filename: string; isPageBundle: boolean };
  } = {};

  /**
   * The field types which hold values that should never be machine translated.
   */
  private static readonly nonTranslatableFieldTypes: FieldType[] = [
    'boolean',
    'choice',
    'contentRelationship',
    'dataFile',
    'datetime',
    'divider',
    'draft',
    'file',
    'heading',
    'image',
    'json',
    'number'
  ];

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
    // Copy the settings, so that the folder locales are not added to the settings
    const i18nSettings = [...(Settings.get<I18nConfig[]>(SETTING_CONTENT_I18N) || [])];

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

    if (pageFolder.path) {
      if (pageFolder.locale) {
        return pageFolder.locale === pageFolder.defaultLocale;
      }

      // The content can be nested within the locale folder, that is why it only checks
      // if the file is located in the folder instead of comparing the directories.
      return typeof i18n.getRelativeFilePath(filePath, pageFolder.path) !== 'undefined';
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

    if (pageFolder && pageFolder.defaultLocale && pageFolder.path && pageFolder.locale) {
      // The content can be nested within the locale folder (ex. `content/de/posts/2024/07/my-post/index.md`),
      // that is why it only checks if the file is located in the locale folder.
      if (typeof i18n.getRelativeFilePath(filePath, pageFolder.path) !== 'undefined') {
        return i18nSettings.find((setting) => setting.locale === pageFolder?.locale);
      }
    }

    pageFolder = await i18n.getPageFolder(filePath);
    if (!pageFolder) {
      return;
    }

    // Check in which locale folder the file is located
    const sourcePath = pageFolder.localeSourcePath || pageFolder.path;
    const locales = i18nSettings
      .filter((setting) => setting.path && pageFolder?.defaultLocale !== setting.locale)
      .sort((a, b) => (b.path as string).length - (a.path as string).length);

    for (const locale of locales) {
      const localePath = join(sourcePath, locale.path as string);
      if (typeof i18n.getRelativeFilePath(filePath, localePath) !== 'undefined') {
        return locale;
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

    if (pageFolder && pageFolder.defaultLocale && pageFolder.localeSourcePath) {
      const relFilePath = await i18n.getLocaleRelativeFilePath(filePath, pageFolder);

      for (const setting of i18nSettings) {
        const translation = join(pageFolder.localeSourcePath, setting.path || '', relFilePath);
        if (await existsAsync(translation)) {
          translations[setting.locale] = {
            locale: setting,
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

    const relFilePath = await i18n.getLocaleRelativeFilePath(filePath, pageFolder);
    const sourcePath = pageFolder.localeSourcePath || pageFolder.path;

    for (const setting of i18nSettings) {
      const translation = join(sourcePath, setting.path || '', relFilePath);
      if (await existsAsync(translation)) {
        translations[setting.locale] = {
          locale: setting,
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
      Notifications.warning(localize(LocalizationKey.commandsI18nCreateWarningNoFileSelected));
      return;
    }

    if (typeof fileUri === 'string') {
      fileUri = Uri.file(fileUri);
    }

    const pageFolder = await Folders.getPageFolderByFilePath(fileUri.fsPath);
    if (!pageFolder || !pageFolder.localeSourcePath) {
      Notifications.error(localize(LocalizationKey.commandsI18nCreateErrorNoContentFolder));
      return;
    }

    const i18nSettings = await i18n.getSettings(fileUri.fsPath);
    if (!i18nSettings) {
      Notifications.warning(localize(LocalizationKey.commandsI18nCreateWarningNoConfig));
      return;
    }

    const sourceLocale = await i18n.getLocale(fileUri.fsPath);
    if (!sourceLocale || !sourceLocale.locale) {
      Notifications.warning(localize(LocalizationKey.commandsI18nCreateErrorNoLocaleDefinition));
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
      Notifications.warning(localize(LocalizationKey.commandsI18nCreateErrorNoLocales));
      return;
    }

    const locale = await window.showQuickPick(
      targetLocales.map((i18n) => i18n.title || i18n.locale),
      {
        title: localize(LocalizationKey.commandsI18nCreateQuickPickTitle),
        placeHolder: localize(LocalizationKey.commandsI18nCreateQuickPickPlaceHolder),
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
      Notifications.warning(localize(LocalizationKey.commandsI18nCreateWarningNoConfig));
      return;
    }

    let article = await ArticleHelper.getFrontMatterByPath(fileUri.fsPath);
    if (!article) {
      Notifications.warning(localize(LocalizationKey.commandsI18nCreateWarningNoFile));
      return;
    }

    const contentType = await ArticleHelper.getContentType(article);
    if (!contentType) {
      Notifications.warning(localize(LocalizationKey.commandsI18nCreateWarningNoContentType));
      return;
    }

    // Get the directory of the file relative to its locale folder
    const fileInfo = parse(fileUri.fsPath);
    const contentDir = await i18n.getLocaleRelativeDir(fileUri.fsPath, pageFolder);

    const i18nDir = join(pageFolder.localeSourcePath, targetLocale.path, contentDir);

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
      Notifications.error(localize(LocalizationKey.commandsI18nCreateErrorFileExists));
      return;
    }

    if (sourceLocale?.locale) {
      article = await i18n.translate(article, contentType, sourceLocale, targetLocale);
    }

    const newFileUri = Uri.file(newFilePath);
    await workspace.fs.writeFile(
      newFileUri,
      Buffer.from(ArticleHelper.stringifyFrontMatter(article.content, article.data))
    );

    await openFileInEditor(newFilePath);

    PagesListener.refresh();

    Notifications.info(
      localize(
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
      Notifications.warning(localize(LocalizationKey.commandsI18nCreateWarningNoFileSelected));
      return;
    }

    if (typeof fileUri === 'string') {
      fileUri = Uri.file(fileUri);
    }

    const pageFolder = await Folders.getPageFolderByFilePath(fileUri.fsPath);
    if (!pageFolder || !pageFolder.localeSourcePath) {
      Notifications.error(localize(LocalizationKey.commandsI18nCreateErrorNoContentFolder));
      return;
    }

    let article = await ArticleHelper.getFrontMatterByPath(fileUri.fsPath);
    if (!article) {
      Notifications.warning(localize(LocalizationKey.commandsI18nCreateWarningNoFile));
      return;
    }

    const contentType = await ArticleHelper.getContentType(article);
    if (!contentType) {
      Notifications.warning(localize(LocalizationKey.commandsI18nCreateWarningNoContentType));
      return;
    }

    const i18nSettings = await i18n.getSettings(fileUri.fsPath);
    if (!i18nSettings) {
      Notifications.warning(localize(LocalizationKey.commandsI18nCreateWarningNoConfig));
      return;
    }

    const sourceLocale = await i18n.getLocale(fileUri.fsPath);
    if (!sourceLocale || !sourceLocale.locale) {
      Notifications.warning(localize(LocalizationKey.commandsI18nCreateErrorNoLocaleDefinition));
      return;
    }

    // Determine translation file paths
    const fileInfo = parse(fileUri.fsPath);
    const contentDir = await i18n.getLocaleRelativeDir(fileUri.fsPath, pageFolder);

    // Gather target locales & metadata
    const translations = (await i18n.getTranslations(fileUri.fsPath)) || {};
    const targetLocales = i18nSettings
      .filter((i18n) => {
        return i18n.path && i18n.locale !== sourceLocale.locale;
      })
      .map((i18n) => {
        return {
          ...i18n,
          dir: join(pageFolder.localeSourcePath!, i18n.path!, contentDir),
          absolutePath: join(pageFolder.localeSourcePath!, i18n.path!, contentDir, fileInfo.base),
          relativePath: join(i18n.path!, contentDir, fileInfo.base)
        };
      })
      .sort((a, b) => (a.title || a.locale).localeCompare(b.title || b.locale));

    if (targetLocales.length === 0) {
      Notifications.warning(localize(LocalizationKey.commandsI18nCreateErrorNoLocales));
      return;
    }

    // Configure quick pick items & options
    const existingTargetLocales = targetLocales.filter((i18n) => translations[i18n.locale]);
    const newTargetLocales = targetLocales.filter((i18n) => !translations[i18n.locale]);
    const quickPickItems: QuickPickItem[] = [
      ...(existingTargetLocales.length
        ? [
            {
              label: localize(LocalizationKey.commandsI18nCreateOrOpenQuickPickCategoryExisting),
              kind: QuickPickItemKind.Separator
            },
            ...existingTargetLocales.map((i18n) => ({
              label: i18n.title || i18n.locale,
              detail: localize(
                LocalizationKey.commandsI18nCreateOrOpenQuickPickActionOpen,
                i18n.relativePath
              )
            }))
          ]
        : []),
      ...(newTargetLocales.length
        ? [
            {
              label: localize(LocalizationKey.commandsI18nCreateOrOpenQuickPickCategoryNew),
              kind: QuickPickItemKind.Separator
            },
            ...newTargetLocales.map((i18n) => ({
              label: i18n.title || i18n.locale,
              detail: `$(file-add) ${localize(
                LocalizationKey.commandsI18nCreateOrOpenQuickPickActionCreate,
                i18n.relativePath
              )}`
            }))
          ]
        : [])
    ];
    const quickPickOptions: QuickPickOptions = {
      title: localize(LocalizationKey.commandsI18nCreateOrOpenQuickPickTitle),
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
      Notifications.warning(localize(LocalizationKey.commandsI18nCreateWarningNoConfig));
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
      article = await i18n.translate(article, contentType, sourceLocale, targetLocale);
    }

    const newFileUri = Uri.file(targetLocale.absolutePath);
    await workspace.fs.writeFile(
      newFileUri,
      Buffer.from(ArticleHelper.stringifyFrontMatter(article.content, article.data))
    );

    await openFileInEditor(targetLocale.absolutePath);

    PagesListener.refresh();

    Notifications.info(
      localize(
        LocalizationKey.commandsI18nCreateSuccessCreated,
        sourceLocale.title || sourceLocale.locale
      )
    );
  }

  /**
   * Translates the given article from the source locale to the target locale using DeepL translation service.
   * @param article - The article to be translated.
   * @param contentType - The content type of the article.
   * @param sourceLocale - The source locale configuration.
   * @param targetLocale - The target locale configuration.
   * @returns A promise that resolves to the translated article.
   */
  private static async translate(
    article: ParsedFrontMatter,
    contentType: IContentType,
    sourceLocale: I18nConfig,
    targetLocale: I18nConfig
  ) {
    return new Promise<ParsedFrontMatter>((resolve) => {
      window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: localize(LocalizationKey.commandsI18nTranslateProgressTitle),
          cancellable: false
        },
        async () => {
          try {
            const values = i18n.getValuesToTranslate(article, contentType);
            if (values.length === 0) {
              resolve(article);
              return;
            }

            const translations = await Translations.translate(
              values.map((value) => value.container[value.key] as string),
              sourceLocale.locale,
              targetLocale.locale
            );

            if (!translations || translations.length !== values.length) {
              resolve(article);
              return;
            }

            for (let i = 0; i < values.length; i++) {
              values[i].container[values[i].key] = translations[i];
            }
          } catch (error) {
            Notifications.error(`${(error as Error).message}`);
          }

          resolve(article);
        }
      );
    });
  }

  /**
   * Retrieves all the values of the article which need to be translated.
   *
   * The title and description fields are translated by default, unless the field is
   * defined with `translate: false`. All other fields require `translate: true` to be
   * taken into account.
   *
   * @param article - The parsed front matter of the article.
   * @param contentType - The content type of the article.
   * @returns The references to the values which need to be translated.
   */
  private static getValuesToTranslate(
    article: ParsedFrontMatter,
    contentType: IContentType
  ): TranslationValue[] {
    const values: TranslationValue[] = [];

    // The title and description fields are translated by default
    const defaultFields = [getTitleField(), getDescriptionField()];
    for (const fieldName of defaultFields) {
      const field = ContentType.findFieldByName(contentType.fields, fieldName);
      if (field && field.translate === false) {
        continue;
      }

      i18n.addValueToTranslate(article.data, fieldName, values);
    }

    i18n.getFieldValuesToTranslate(contentType.fields, article.data, values);

    // The content of the article is always translated
    i18n.addValueToTranslate(article, 'content', values);

    return values;
  }

  /**
   * Retrieves the values of the fields which are marked to be translated.
   *
   * @param fields - The fields to check.
   * @param data - The data object which holds the field values.
   * @param values - The references to the values which need to be translated.
   */
  private static getFieldValuesToTranslate(
    fields: Field[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { [key: string]: any } | undefined,
    values: TranslationValue[]
  ): void {
    if (!fields || !data) {
      return;
    }

    for (const field of fields) {
      const value = data[field.name];

      if (field.type === 'fields' && field.fields) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          i18n.getFieldValuesToTranslate(field.fields, value, values);
        }
        continue;
      }

      if (field.type === 'block') {
        i18n.getBlockValuesToTranslate(field, value, values);
        continue;
      }

      if (!field.translate || i18n.nonTranslatableFieldTypes.includes(field.type)) {
        continue;
      }

      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          i18n.addValueToTranslate(value, i, values);
        }
      } else {
        i18n.addValueToTranslate(data, field.name, values);
      }
    }
  }

  /**
   * Retrieves the values to translate from the items of a block field.
   *
   * @param field - The block field.
   * @param value - The value of the block field.
   * @param values - The references to the values which need to be translated.
   */
  private static getBlockValuesToTranslate(
    field: Field,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    values: TranslationValue[]
  ): void {
    if (!Array.isArray(value)) {
      return;
    }

    const fieldGroups = Settings.get<FieldGroup[]>(SETTING_TAXONOMY_FIELD_GROUPS);
    if (!fieldGroups) {
      return;
    }

    const groupIds = Array.isArray(field.fieldGroup)
      ? field.fieldGroup
      : field.fieldGroup
      ? [field.fieldGroup]
      : [];

    for (const item of value) {
      if (!item || typeof item !== 'object') {
        continue;
      }

      // When the block only allows a single group, the item doesn't need to define it
      const groupId = item.fieldGroup || (groupIds.length === 1 ? groupIds[0] : undefined);
      const group = fieldGroups.find((group) => group.id === groupId);
      if (!group || !group.fields) {
        continue;
      }

      i18n.getFieldValuesToTranslate(group.fields, item, values);
    }
  }

  /**
   * Adds the reference to the value to translate, when the value is a non-empty string
   * and it hasn't been added yet.
   *
   * @param container - The object or array which holds the value.
   * @param key - The key or index of the value.
   * @param values - The references to the values which need to be translated.
   */
  private static addValueToTranslate(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    container: any,
    key: string | number,
    values: TranslationValue[]
  ): void {
    const value = container[key];
    if (typeof value !== 'string' || !value) {
      return;
    }

    if (values.some((value) => value.container === container && value.key === key)) {
      return;
    }

    values.push({ container, key });
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
   * Retrieves the path of the file relative to the given folder.
   *
   * @param filePath - The path of the file.
   * @param folderPath - The path of the folder.
   * @returns The relative path of the file, or `undefined` when the file is not located in the folder.
   */
  private static getRelativeFilePath(filePath: string, folderPath?: string): string | undefined {
    if (!filePath || !folderPath) {
      return;
    }

    let parsedFolderPath = parseWinPath(folderPath);
    if (!parsedFolderPath.endsWith('/')) {
      parsedFolderPath += '/';
    }

    const parsedFilePath = parseWinPath(filePath);
    if (!parsedFilePath.toLowerCase().startsWith(parsedFolderPath.toLowerCase())) {
      return;
    }

    return parsedFilePath.substring(parsedFolderPath.length);
  }

  /**
   * Retrieves the path of the file relative to its locale folder.
   *
   * The content can be nested within the locale folder, the whole folder structure is kept
   * (ex. `posts/2024/07/my-post/index.md`) so that translations use the same structure.
   *
   * @param filePath - The path of the file.
   * @param pageFolder - The content folder of the file.
   * @returns The relative path of the file.
   */
  private static async getLocaleRelativeFilePath(
    filePath: string,
    pageFolder: ContentFolder
  ): Promise<string> {
    const relFilePath = i18n.getRelativeFilePath(filePath, pageFolder.path);
    if (typeof relFilePath !== 'undefined') {
      return relFilePath;
    }

    const fileInfo = await i18n.getFileInfo(filePath);
    return fileInfo.filename;
  }

  /**
   * Retrieves the directory of the file relative to its locale folder.
   *
   * @param filePath - The path of the file.
   * @param pageFolder - The content folder of the file.
   * @returns The relative directory of the file, or an empty string when the file is located in the root of the locale folder.
   */
  private static async getLocaleRelativeDir(
    filePath: string,
    pageFolder: ContentFolder
  ): Promise<string> {
    const relFilePath = await i18n.getLocaleRelativeFilePath(filePath, pageFolder);
    const relDir = parse(relFilePath).dir;

    return relDir ? join(relDir) : '';
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

    // Check in which locale folder the file is located, the deepest folder wins
    const sortedFolders = [...localeFolders].sort(
      (a, b) => (b.path || '').length - (a.path || '').length
    );
    for (const folder of sortedFolders) {
      if (typeof i18n.getRelativeFilePath(filePath, folder.path) !== 'undefined') {
        return folder;
      }
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
