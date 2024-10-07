import {
  Position,
  TextDocument,
  TextDocumentWillSaveEvent,
  TextEdit,
  Uri,
  commands,
  window,
  workspace
} from 'vscode';
import { Folders } from './Folders';
import { DEFAULT_CONTENT_TYPE } from './../constants/ContentType';
import { isValidFile } from './../helpers/isValidFile';
import {
  SETTING_AUTO_UPDATE_DATE,
  SETTING_SLUG_UPDATE_FILE_NAME,
  SETTING_TEMPLATES_PREFIX,
  CONFIG_KEY,
  SETTING_DATE_FORMAT,
  SETTING_SLUG_PREFIX,
  SETTING_SLUG_SUFFIX,
  SETTING_CONTENT_PLACEHOLDERS,
  SETTING_SLUG_TEMPLATE
} from './../constants';
import { CustomPlaceholder, Field } from '../models';
import { format } from 'date-fns';
import {
  ArticleHelper,
  Logger,
  Settings,
  SlugHelper,
  processArticlePlaceholdersFromData,
  processTimePlaceholders
} from '../helpers';
import { Notifications } from '../helpers/Notifications';
import { extname, basename, parse, dirname } from 'path';
import { COMMAND_NAME, DefaultFields } from '../constants';
import { DashboardData, SnippetInfo, SnippetRange } from '../models/DashboardData';
import { DateHelper } from '../helpers/DateHelper';
import { parseWinPath } from '../helpers/parseWinPath';
import { ParsedFrontMatter } from '../parsers';
import { MediaListener } from '../listeners/panel';
import { NavigationType } from '../dashboardWebView/models';
import { SNIPPET } from '../constants/Snippet';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';
import { getTitleField } from '../utils';

export class Article {
  /**
   * Registers the commands for the Article class.
   *
   * @param subscriptions - The array of subscriptions to register the commands with.
   */
  public static async registerCommands(subscriptions: unknown[]) {
    subscriptions.push(
      commands.registerCommand(COMMAND_NAME.setLastModifiedDate, Article.setLastModifiedDate)
    );

    subscriptions.push(commands.registerCommand(COMMAND_NAME.generateSlug, Article.updateSlug));

    // Inserting an image in Markdown
    subscriptions.push(commands.registerCommand(COMMAND_NAME.insertMedia, Article.insertMedia));

    // Inserting a snippet in Markdown
    subscriptions.push(commands.registerCommand(COMMAND_NAME.insertSnippet, Article.insertSnippet));
  }

  /**
   * Sets the article date
   */
  public static async setDate() {
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    let article = ArticleHelper.getFrontMatter(editor);
    if (!article) {
      return;
    }

    article = await this.updateDate(article);

    try {
      ArticleHelper.update(editor, article);
    } catch (e) {
      Notifications.error(
        l10n.t(LocalizationKey.commandsArticleSetDateError, `${CONFIG_KEY}${SETTING_DATE_FORMAT}`)
      );
    }
  }

  /**
   * Update the date in the front matter
   * @param article
   */
  public static async updateDate(article: ParsedFrontMatter) {
    article.data = await ArticleHelper.updateDates(article);
    return article;
  }

  /**
   * Sets the article lastmod date
   */
  public static async setLastModifiedDate() {
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    const updatedArticle = await this.setLastModifiedDateInner(editor.document);

    if (typeof updatedArticle === 'undefined') {
      return;
    }

    ArticleHelper.update(editor, updatedArticle as ParsedFrontMatter);
  }

  public static async setLastModifiedDateOnSave(document: TextDocument): Promise<TextEdit[]> {
    const updatedArticle = await this.setLastModifiedDateInner(document);

    if (typeof updatedArticle === 'undefined') {
      return [];
    }

    const update = ArticleHelper.generateUpdate(document, updatedArticle);

    return [update];
  }

  private static async setLastModifiedDateInner(
    document: TextDocument
  ): Promise<ParsedFrontMatter | undefined> {
    Logger.verbose(`Article:setLastModifiedDateInner:Start`);
    const article = ArticleHelper.getFrontMatterFromDocument(document);

    // Only set the date, if there is already front matter set
    if (!article || !article.data || Object.keys(article.data).length === 0) {
      return;
    }

    const cloneArticle = Object.assign({}, article);
    const dateField = await ArticleHelper.getModifiedDateField(article);
    Logger.verbose(`Article:setLastModifiedDateInner:DateField - ${JSON.stringify(dateField)}`);

    try {
      const fieldName = dateField?.name || DefaultFields.LastModified;
      const fieldValue = Article.formatDate(new Date(), dateField?.dateFormat);
      cloneArticle.data[fieldName] = fieldValue;
      Logger.verbose(
        `Article:setLastModifiedDateInner:DateField name - ${fieldName} - value - ${fieldValue}`
      );
      Logger.verbose(`Article:setLastModifiedDateInner:End`);
      return cloneArticle;
    } catch (e: unknown) {
      Notifications.error(
        l10n.t(LocalizationKey.commandsArticleSetDateError, `${CONFIG_KEY}${SETTING_DATE_FORMAT}`)
      );
    }
  }

  /**
   * Generate the new slug
   */
  public static generateSlug(title: string, article?: ParsedFrontMatter, slugTemplate?: string) {
    if (!title) {
      return;
    }

    const prefix = Settings.get(SETTING_SLUG_PREFIX) as string;
    const suffix = Settings.get(SETTING_SLUG_SUFFIX) as string;

    if (article?.data) {
      const slug = SlugHelper.createSlug(title, article?.data, slugTemplate);

      if (typeof slug === 'string') {
        return {
          slug,
          slugWithPrefixAndSuffix: `${prefix}${slug}${suffix}`
        };
      }
    }

    return undefined;
  }

  /**
   * Generate the slug based on the article title
   */
  public static async updateSlug() {
    const updateFileName = Settings.get(SETTING_SLUG_UPDATE_FILE_NAME) as string;
    const editor = window.activeTextEditor;

    if (!editor) {
      return;
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (!article || !article.data) {
      return;
    }

    const titleField = getTitleField();
    const articleTitle: string = article.data[titleField];
    const articleDate = await ArticleHelper.getDate(article);

    let filePrefix = Settings.get<string>(SETTING_TEMPLATES_PREFIX);
    const contentType = await ArticleHelper.getContentType(article);
    filePrefix = await ArticleHelper.getFilePrefix(
      filePrefix,
      editor.document.uri.fsPath,
      contentType,
      articleTitle,
      articleDate
    );

    const slugInfo = Article.generateSlug(articleTitle, article, contentType.slugTemplate);

    if (
      slugInfo &&
      typeof slugInfo.slug === 'string' &&
      typeof slugInfo.slugWithPrefixAndSuffix === 'string'
    ) {
      article.data['slug'] = slugInfo.slugWithPrefixAndSuffix;

      if (contentType) {
        // Update the fields containing the slug placeholder
        const fieldsToUpdate: Field[] = contentType.fields.filter((f) => f.default === '{{slug}}');
        for (const field of fieldsToUpdate) {
          article.data[field.name] = slugInfo.slug;
        }

        // Update the fields containing a custom placeholder that depends on slug
        const placeholders = Settings.get<CustomPlaceholder[]>(SETTING_CONTENT_PLACEHOLDERS);
        const customPlaceholders = placeholders?.filter(
          (p) => p.value && p.value.includes('{{slug}}')
        );
        const dateFormat = Settings.get(SETTING_DATE_FORMAT) as string;
        for (const customPlaceholder of customPlaceholders || []) {
          const customPlaceholderFields = contentType.fields.filter(
            (f) => f.default === `{{${customPlaceholder.id}}}`
          );
          for (const pField of customPlaceholderFields) {
            article.data[pField.name] = customPlaceholder.value;
            article.data[pField.name] = processArticlePlaceholdersFromData(
              article.data[pField.name],
              article.data,
              contentType
            );
            article.data[pField.name] = processTimePlaceholders(
              article.data[pField.name],
              dateFormat
            );
          }
        }
      }

      ArticleHelper.update(editor, article);

      // Check if the file name should be updated by the slug
      // This is required for systems like Jekyll
      if (updateFileName) {
        const editor = window.activeTextEditor;
        if (editor) {
          const ext = extname(editor.document.fileName);
          const fileName = basename(editor.document.fileName);

          let slugName = slugInfo.slug.startsWith('/') ? slugInfo.slug.substring(1) : slugInfo.slug;
          slugName = slugName.endsWith('/') ? slugName.substring(0, slugName.length - 1) : slugName;

          let newFileName = `${slugName}${ext}`;
          if (filePrefix && typeof filePrefix === 'string') {
            if (filePrefix.endsWith('/')) {
              newFileName = `${filePrefix}${newFileName}`;
            } else {
              newFileName = `${filePrefix}-${newFileName}`;
            }
          }

          const newPath = editor.document.uri.fsPath.replace(fileName, newFileName);

          try {
            await editor.document.save();

            await workspace.fs.rename(editor.document.uri, Uri.file(newPath), {
              overwrite: false
            });
          } catch (e: unknown) {
            Notifications.error(
              l10n.t(
                LocalizationKey.commandsArticleUpdateSlugError,
                ((e as Error).message || e) as string
              )
            );
          }
        }
      }
    }
  }

  /**
   * Retrieve the slug from the front matter
   */
  public static getSlug(pathname?: string) {
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    const file = parseWinPath(editor.document.fileName);
    if (!isValidFile(file)) {
      return;
    }

    const parsedFile = parse(file);

    const titleField = getTitleField();
    const slugTemplate = Settings.get<string>(SETTING_SLUG_TEMPLATE);
    if (slugTemplate) {
      if (slugTemplate === '{{title}}') {
        const article = ArticleHelper.getFrontMatter(editor);
        if (article?.data && article.data[titleField]) {
          return article.data[titleField].toLowerCase().replace(/\s/g, '-');
        }
      } else {
        const article = ArticleHelper.getFrontMatter(editor);
        if (article?.data) {
          return SlugHelper.createSlug(article.data[titleField], article.data, slugTemplate);
        }
      }
    }

    const suffix = Settings.get(SETTING_SLUG_SUFFIX) as string;
    const prefix = Settings.get(SETTING_SLUG_PREFIX) as string;

    if (parsedFile.name.toLowerCase() !== 'index') {
      return `${prefix}${parsedFile.name}${suffix}`;
    }

    if (parsedFile.name.toLowerCase() === 'index' && pathname) {
      return ``;
    }

    const folderName = basename(dirname(file));
    return folderName;
  }

  /**
   * Toggle the page its draft mode
   */
  public static async toggleDraft() {
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }
    const article = ArticleHelper.getFrontMatter(editor);
    if (!article) {
      return;
    }

    const newDraftStatus = !article.data['draft'];
    article.data['draft'] = newDraftStatus;
    ArticleHelper.update(editor, article);
  }

  /**
   * Article auto updater
   * @param event
   */
  public static async autoUpdate(event: TextDocumentWillSaveEvent) {
    const document = event.document;
    if (document && ArticleHelper.isSupportedFile(document)) {
      const autoUpdate = Settings.get(SETTING_AUTO_UPDATE_DATE);

      // Is article located in one of the content folders
      const folders = await Folders.getCachedOrFresh();
      const documentPath = parseWinPath(document.fileName);
      const folder = folders.find((f) => documentPath.startsWith(f.path));
      if (!folder) {
        return;
      }

      if (autoUpdate) {
        event.waitUntil(Article.setLastModifiedDateOnSave(document));
      }
    }
  }

  /**
   * Format the date to the defined format
   */
  public static formatDate(dateValue: Date, fieldDateFormat?: string): string {
    const dateFormat = Settings.get(SETTING_DATE_FORMAT) as string;

    Logger.verbose(`Article:formatDate:Start`);

    if (fieldDateFormat) {
      Logger.verbose(`Article:formatDate:FieldDateFormat - ${fieldDateFormat}`);
      return format(dateValue, DateHelper.formatUpdate(fieldDateFormat) as string);
    } else if (dateFormat && typeof dateFormat === 'string') {
      Logger.verbose(`Article:formatDate:DateFormat - ${dateFormat}`);
      return format(dateValue, DateHelper.formatUpdate(dateFormat) as string);
    } else {
      Logger.verbose(`Article:formatDate:toISOString - ${dateValue}`);
      return typeof dateValue.toISOString === 'function'
        ? dateValue.toISOString()
        : dateValue?.toString();
    }
  }

  /**
   * Insert an image from the media dashboard into the article
   */
  public static async insertMedia() {
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    const article = ArticleHelper.getFrontMatter(editor);
    const contentType =
      article && article.data ? await ArticleHelper.getContentType(article) : DEFAULT_CONTENT_TYPE;

    const position = editor.selection.active;
    const selectionText = editor.document.getText(editor.selection);

    await commands.executeCommand(COMMAND_NAME.dashboard, {
      type: 'media',
      data: {
        pageBundle: !!contentType.pageBundle,
        filePath: editor.document.uri.fsPath,
        fieldName: basename(editor.document.uri.fsPath),
        position,
        selection: selectionText
      }
    } as DashboardData);

    // Let the editor panel know you are selecting an image
    MediaListener.getMediaSelection();
  }

  /**
   * Insert a snippet into the article
   */
  public static async insertSnippet() {
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    const position = editor.selection.active;
    const selectionText = editor.document.getText(editor.selection);

    // Check for snippet wrapper
    const selectionStart = editor.selection.start;
    const docText = editor.document.getText();
    const docTextLines = docText.split(`\n`);
    const snippetEndAfterPos = docTextLines.findIndex((value: string, idx: number) => {
      return value.includes(SNIPPET.wrapper.end) && idx >= selectionStart.line;
    });

    const snippetStartAfterPos = docTextLines.findIndex((value: string, idx: number) => {
      return value.includes(SNIPPET.wrapper.start) && idx > selectionStart.line;
    });

    const linesBeforeSelection = docTextLines.slice(0, selectionStart.line + 1);

    let snippetStartBeforePos = linesBeforeSelection
      .reverse()
      .findIndex((r) => r.includes(SNIPPET.wrapper.start));

    if (snippetStartBeforePos > -1) {
      snippetStartBeforePos = linesBeforeSelection.length - snippetStartBeforePos - 1;
    }

    let snippetInfo: SnippetInfo | undefined = undefined;
    let range: SnippetRange | undefined = undefined;
    if (
      snippetEndAfterPos > -1 &&
      (snippetStartAfterPos > snippetEndAfterPos || snippetStartAfterPos === -1) &&
      snippetStartBeforePos
    ) {
      // Content was within a snippet block, get all the text
      const snippetBlock = docTextLines.slice(snippetStartBeforePos, snippetEndAfterPos + 1);
      const firstLine = snippetBlock[0];

      range = {
        start: new Position(snippetStartBeforePos, 0),
        end: new Position(snippetEndAfterPos, snippetBlock[snippetBlock.length - 1].length)
      };

      const data = firstLine
        .replace(`<!-- ${SNIPPET.wrapper.start} data:`, '')
        .replace(' -->', '')
        .replace(/'/g, '"');
      snippetInfo = JSON.parse(data);
    }

    const article = ArticleHelper.getFrontMatter(editor);
    const contentType = article ? await ArticleHelper.getContentType(article) : undefined;
    const tileField = getTitleField();

    await commands.executeCommand(COMMAND_NAME.dashboard, {
      type: NavigationType.Snippets,
      data: {
        fileTitle: article?.data[tileField] || '',
        filePath: editor.document.uri.fsPath,
        fieldName: basename(editor.document.uri.fsPath),
        contentType,
        position,
        range,
        selection: selectionText,
        snippetInfo
      }
    } as DashboardData);
  }

  /**
   * Update the article date and return it
   * @param article
   * @param dateFormat
   * @param field
   * @param forceCreate
   */
  private static articleDate(article: ParsedFrontMatter, field: string, forceCreate: boolean) {
    if (typeof article.data[field] !== 'undefined' || forceCreate) {
      article.data[field] = Article.formatDate(new Date());
    }
    return article;
  }
}
