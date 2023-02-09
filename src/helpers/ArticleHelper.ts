import * as jsoncParser from 'jsonc-parser';
import { CustomPlaceholder } from './../models/CustomPlaceholder';
import { Uri, workspace } from 'vscode';
import { MarkdownFoldingProvider } from './../providers/MarkdownFoldingProvider';
import { DEFAULT_CONTENT_TYPE, DEFAULT_CONTENT_TYPE_NAME } from './../constants/ContentType';
import * as vscode from 'vscode';
import {
  DefaultFields,
  SETTING_CONTENT_DEFAULT_FILETYPE,
  SETTING_CONTENT_PLACEHOLDERS,
  SETTING_CONTENT_SUPPORTED_FILETYPES,
  SETTING_FILE_PRESERVE_CASING,
  SETTING_COMMA_SEPARATED_FIELDS,
  SETTING_DATE_FIELD,
  SETTING_DATE_FORMAT,
  SETTING_INDENT_ARRAY,
  SETTING_REMOVE_QUOTES,
  SETTING_SITE_BASEURL,
  SETTING_TAXONOMY_CONTENT_TYPES,
  SETTING_TEMPLATES_PREFIX,
  SETTING_MODIFIED_FIELD,
  DefaultFieldValues
} from '../constants';
import { DumpOptions } from 'js-yaml';
import { FrontMatterParser, ParsedFrontMatter } from '../parsers';
import { Extension, Logger, Settings, SlugHelper } from '.';
import { format, parse } from 'date-fns';
import { Notifications } from './Notifications';
import { Article } from '../commands';
import { join } from 'path';
import { EditorHelper } from '@estruyf/vscode';
import sanitize from '../helpers/Sanitize';
import { ContentType } from '../models';
import { DateHelper } from './DateHelper';
import { DiagnosticSeverity, Position, window, Range } from 'vscode';
import { DEFAULT_FILE_TYPES } from '../constants/DefaultFileTypes';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { Link, Parent } from 'mdast-util-from-markdown/lib';
import { Content } from 'mdast';
import { processKnownPlaceholders } from './PlaceholderHelper';
import { CustomScript } from './CustomScript';
import { Folders } from '../commands/Folders';
import { existsAsync, readFileAsync } from '../utils';
import { mkdirAsync } from '../utils/mkdirAsync';

export class ArticleHelper {
  private static notifiedFiles: string[] = [];

  /**
   * Get the contents of the current article
   *
   * @param editor
   */
  public static getFrontMatter(editor: vscode.TextEditor) {
    return ArticleHelper.getFrontMatterFromDocument(editor.document);
  }

  /**
   * Get the contents of the specified document
   *
   * @param document The document to parse.
   */
  public static getFrontMatterFromDocument(document: vscode.TextDocument) {
    const fileContents = document.getText();
    return ArticleHelper.parseFile(fileContents, document.fileName);
  }

  /**
   * Get the current article
   */
  public static getCurrent(): ParsedFrontMatter | undefined {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (!article) {
      return;
    }

    return article;
  }

  /**
   * Retrieve the file's front matter by its path
   * @param filePath
   */
  public static async getFrontMatterByPath(filePath: string) {
    const file = await readFileAsync(filePath, { encoding: 'utf-8' });
    return ArticleHelper.parseFile(file, filePath);
  }

  /**
   * Store the new information in the file
   *
   * @param editor
   * @param article
   */
  public static async update(editor: vscode.TextEditor, article: ParsedFrontMatter) {
    const update = this.generateUpdate(editor.document, article);

    await editor.edit((builder) => builder.replace(update.range, update.newText));
  }

  /**
   * Store the new information for the article path
   *
   * @param path
   * @param article
   */
  public static async updateByPath(path: string, article: ParsedFrontMatter) {
    const file = await workspace.openTextDocument(Uri.parse(path));
    const editor = await window.showTextDocument(file);

    if (file && editor) {
      const update = this.generateUpdate(file, article);

      await editor.edit((builder) => builder.replace(update.range, update.newText));
    }
  }

  /**
   * Generate the update to be applied to the article.
   * @param article
   */
  public static generateUpdate(
    document: vscode.TextDocument,
    article: ParsedFrontMatter
  ): vscode.TextEdit {
    const nrOfLines = document.lineCount as number;
    const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(nrOfLines, 0));
    const removeQuotes = Settings.get(SETTING_REMOVE_QUOTES) as string[];
    const commaSeparated = Settings.get<string[]>(SETTING_COMMA_SEPARATED_FIELDS);

    // Check if there is a line ending
    const lines = article.content.split('\n');
    const lastLine = lines.pop();
    const endsWithNewLine = lastLine !== undefined && lastLine.trim() === '';

    let newMarkdown = this.stringifyFrontMatter(
      article.content,
      Object.assign({}, article.data),
      document?.getText()
    );

    // Logic to not include a new line at the end of the file
    if (!endsWithNewLine) {
      const lines = newMarkdown.split('\n');
      const lastLine = lines.pop();
      if (lastLine !== undefined && lastLine?.trim() === '') {
        newMarkdown = lines.join('\n');
      }
    }

    // Check for field where quotes need to be removed
    if (removeQuotes && removeQuotes.length) {
      for (const toRemove of removeQuotes) {
        if (article && article.data && article.data[toRemove]) {
          if (commaSeparated?.includes(toRemove)) {
            const textToReplace = article.data[toRemove].join(', ');
            newMarkdown = newMarkdown.replace(`'${textToReplace}'`, textToReplace);
            newMarkdown = newMarkdown.replace(`"${textToReplace}"`, textToReplace);
          } else {
            newMarkdown = newMarkdown.replace(
              `'${article.data[toRemove]}'`,
              article.data[toRemove]
            );
            newMarkdown = newMarkdown.replace(
              `"${article.data[toRemove]}"`,
              article.data[toRemove]
            );
          }
        }
      }
    }

    return vscode.TextEdit.replace(range, newMarkdown);
  }

  /**
   * Stringify the front matter
   *
   * @param content
   * @param data
   * @param originalContent
   */
  public static stringifyFrontMatter(content: string, data: any, originalContent?: string) {
    const indentArray = Settings.get(SETTING_INDENT_ARRAY) as boolean;
    const commaSeparated = Settings.get<string[]>(SETTING_COMMA_SEPARATED_FIELDS);

    const spaces = vscode.window.activeTextEditor?.options?.tabSize;

    if (commaSeparated) {
      for (const key of commaSeparated) {
        if (data[key] && typeof data[key] === 'object') {
          data[key] = data[key].join(', ');
        }
      }
    }

    return FrontMatterParser.toFile(content, data, originalContent, {
      noArrayIndent: !indentArray,
      skipInvalid: true,
      noCompatMode: true,
      lineWidth: 500,
      indent: spaces || 2
    } as DumpOptions as any);
  }

  /**
   * Checks if the current file is a markdown file
   */
  public static isSupportedFile(document: vscode.TextDocument | undefined | null = null) {
    const supportedLanguages = ['markdown', 'mdx'];
    const fileTypes = Settings.get<string[]>(SETTING_CONTENT_SUPPORTED_FILETYPES);
    const supportedFileExtensions = fileTypes
      ? fileTypes.map((f) => (f.startsWith(`.`) ? f : `.${f}`))
      : DEFAULT_FILE_TYPES;
    const languageId = document?.languageId?.toLowerCase();
    const isSupportedLanguage = languageId && supportedLanguages.includes(languageId);
    document ??= vscode.window.activeTextEditor?.document;

    /**
     * It's possible that the file is a file type we support but the user hasn't installed
     * language support for. In that case, we'll manually check the extension as a proxy
     * for whether or not we support the file.
     */
    if (!isSupportedLanguage) {
      const fileName = document?.fileName?.toLowerCase();

      return (
        fileName &&
        supportedFileExtensions.findIndex((fileExtension) => fileName.endsWith(fileExtension)) > -1
      );
    }

    return isSupportedLanguage;
  }

  /**
   * Get date from front matter
   */
  public static getDate(article: ParsedFrontMatter | null) {
    if (!article || !article.data) {
      return;
    }

    const dateFormat = Settings.get(SETTING_DATE_FORMAT) as string;
    const dateField = ArticleHelper.getPublishDateField(article) || DefaultFields.PublishingDate;

    if (typeof article.data[dateField] !== 'undefined') {
      if (dateFormat && typeof dateFormat === 'string') {
        const date = parse(article.data[dateField], dateFormat, new Date());
        return date;
      } else {
        const date = new Date(article.data[dateField]);
        return date;
      }
    }
    return;
  }

  /**
   * Retrieve the publishing date field name
   * @param article
   * @returns
   */
  public static getPublishDateField(article: ParsedFrontMatter | null) {
    if (!article || !article.data) {
      return;
    }

    const articleCt = ArticleHelper.getContentType(article.data);
    const pubDateField = articleCt.fields.find((f) => f.isPublishDate);

    return (
      pubDateField?.name ||
      (Settings.get(SETTING_DATE_FIELD) as string) ||
      DefaultFields.PublishingDate
    );
  }

  /**
   * Retrieve the publishing date field name
   * @param article
   * @returns
   */
  public static getModifiedDateField(article: ParsedFrontMatter | null) {
    if (!article || !article.data) {
      return;
    }

    const articleCt = ArticleHelper.getContentType(article.data);
    const modDateField = articleCt.fields.find((f) => f.isModifiedDate);

    return (
      modDateField?.name ||
      (Settings.get(SETTING_MODIFIED_FIELD) as string) ||
      DefaultFields.LastModified
    );
  }

  /**
   * Retrieve all the content types
   * @returns
   */
  public static getContentTypes() {
    return Settings.get<ContentType[]>(SETTING_TAXONOMY_CONTENT_TYPES) || [DEFAULT_CONTENT_TYPE];
  }

  /**
   * Retrieve the content type of the current file
   * @param updatedMetadata
   */
  public static getContentType(metadata: { [field: string]: string }): ContentType {
    const contentTypes = ArticleHelper.getContentTypes();

    if (!contentTypes || !metadata) {
      return DEFAULT_CONTENT_TYPE;
    }

    let contentType = contentTypes.find(
      (ct) => ct.name === (metadata.type || DEFAULT_CONTENT_TYPE_NAME)
    );
    if (!contentType) {
      contentType = contentTypes.find((ct) => ct.name === DEFAULT_CONTENT_TYPE_NAME);
    }

    if (contentType) {
      if (!contentType.fields) {
        contentType.fields = DEFAULT_CONTENT_TYPE.fields;
      }

      return contentType;
    }

    return DEFAULT_CONTENT_TYPE;
  }

  /**
   * Update all dates in the metadata
   * @param metadata
   */
  public static updateDates(metadata: { [field: string]: string }) {
    const contentType = ArticleHelper.getContentType(metadata);
    const dateFields = contentType.fields.filter((field) => field.type === 'datetime');

    for (const dateField of dateFields) {
      if (typeof metadata[dateField.name] !== 'undefined') {
        metadata[dateField.name] = Article.formatDate(new Date());
      }
    }

    return metadata;
  }

  /**
   * Sanitize the value
   * @param value
   * @returns
   */
  public static sanitize(value: string): string {
    const preserveCasing = Settings.get(SETTING_FILE_PRESERVE_CASING) as boolean;
    return sanitize((preserveCasing ? value : value.toLowerCase()).replace(/ /g, '-'));
  }

  /**
   * Create the file or folder for the new content
   * @param contentType
   * @param folderPath
   * @param titleValue
   * @returns The new file path
   */
  public static async createContent(
    contentType: ContentType | undefined,
    folderPath: string,
    titleValue: string,
    fileExtension?: string
  ): Promise<string | undefined> {
    FrontMatterParser.currentContent = null;

    const fileType = Settings.get<string>(SETTING_CONTENT_DEFAULT_FILETYPE);

    let prefix = Settings.get<string>(SETTING_TEMPLATES_PREFIX);
    prefix = ArticleHelper.getFilePrefix(folderPath, contentType);

    // Name of the file or folder to create
    let sanitizedName = ArticleHelper.sanitize(titleValue);
    let newFilePath: string | undefined;

    // Create a folder with the `index.md` file
    if (contentType?.pageBundle) {
      if (prefix && typeof prefix === 'string') {
        sanitizedName = `${prefix}-${sanitizedName}`;
      }

      const newFolder = join(folderPath, sanitizedName);
      if (await existsAsync(newFolder)) {
        Notifications.error(
          `A page bundle with the name ${sanitizedName} already exists in ${folderPath}`
        );
        return;
      } else {
        await mkdirAsync(newFolder, { recursive: true });
        newFilePath = join(newFolder, `index.${fileExtension || contentType.fileType || fileType}`);
      }
    } else {
      let newFileName = `${sanitizedName}.${fileExtension || contentType?.fileType || fileType}`;

      if (prefix && typeof prefix === 'string') {
        newFileName = `${prefix}-${newFileName}`;
      }

      newFilePath = join(folderPath, newFileName);

      await mkdirAsync(folderPath, { recursive: true });

      if (await existsAsync(newFilePath)) {
        Notifications.warning(`Content with the title already exists. Please specify a new title.`);
        return;
      }
    }

    return newFilePath;
  }

  /**
   * Retrieve the file prefix
   * @param filePath
   * @param contentType
   * @returns
   */
  public static getFilePrefix(filePath?: string, contentType?: ContentType): string | undefined {
    let prefix = undefined;

    // Retrieve the file prefix from the folder
    if (filePath) {
      const filePrefixOnFolder = Folders.getFilePrefixByFolderPath(filePath);
      if (typeof filePrefixOnFolder !== 'undefined') {
        prefix = filePrefixOnFolder;
      }
    }

    // Retrieve the file prefix from the content type
    if (contentType && typeof contentType.filePrefix !== 'undefined') {
      prefix = contentType.filePrefix;
    }

    // Process the prefix date formatting
    if (prefix && typeof prefix === 'string') {
      prefix = `${format(new Date(), DateHelper.formatUpdate(prefix) as string)}`;
    }

    return prefix;
  }

  /**
   * Update placeholder values in the front matter content
   * @param data
   * @param title
   * @returns
   */
  public static async updatePlaceholders(data: any, title: string, filePath: string) {
    const dateFormat = Settings.get(SETTING_DATE_FORMAT) as string;
    const fmData = Object.assign({}, data);

    for (const fieldName of Object.keys(fmData)) {
      const fieldValue = fmData[fieldName];

      if (fieldName === 'title' && (fieldValue === null || fieldValue === '')) {
        fmData[fieldName] = title;
      }

      if (fieldName === 'slug' && (fieldValue === null || fieldValue === '')) {
        fmData[fieldName] = SlugHelper.createSlug(title);
      }

      fmData[fieldName] = processKnownPlaceholders(fmData[fieldName], title, dateFormat);
      fmData[fieldName] = await this.processCustomPlaceholders(fmData[fieldName], title, filePath);
    }

    return fmData;
  }

  /**
   * Replace the custom placeholders
   * @param value
   * @param title
   * @returns
   */
  public static async processCustomPlaceholders(
    value: string,
    title: string | undefined,
    filePath: string | undefined
  ) {
    if (value && typeof value === 'string') {
      const dateFormat = Settings.get(SETTING_DATE_FORMAT) as string;
      const placeholders = Settings.get<CustomPlaceholder[]>(SETTING_CONTENT_PLACEHOLDERS);
      if (placeholders && placeholders.length > 0) {
        for (const placeholder of placeholders) {
          if (value.includes(`{{${placeholder.id}}}`)) {
            try {
              let placeHolderValue = placeholder.value || '';
              if (placeholder.script) {
                const wsFolder = Folders.getWorkspaceFolder();
                const script = {
                  title: placeholder.id,
                  script: placeholder.script,
                  command: placeholder.command
                };
                let output: string | any = await CustomScript.executeScript(
                  script,
                  wsFolder?.fsPath || '',
                  `'${wsFolder?.fsPath}' '${filePath}' '${title}'`
                );

                if (output) {
                  // Check if the output needs to be parsed
                  if (output.includes('{') && output.includes('}')) {
                    try {
                      output = jsoncParser.parse(output);
                    } catch (e) {
                      // Do nothing
                    }
                  } else {
                    if (output.includes('\n')) {
                      output = output.split('\n');
                    }
                  }

                  placeHolderValue = output;
                }
              }

              const regex = new RegExp(`{{${placeholder.id}}}`, 'g');
              const updatedValue = processKnownPlaceholders(placeHolderValue, title, dateFormat);

              if (value === `{{${placeholder.id}}}`) {
                value = updatedValue;
              } else {
                value = value.replace(regex, updatedValue);
              }
            } catch (e) {
              Notifications.error(`Error while processing the ${placeholder.id} placeholder`);
              Logger.error((e as Error).message);

              value = DefaultFieldValues.faultyCustomPlaceholder;
            }
          }
        }
      }
    }

    return value;
  }

  /**
   * Get the details of the current article
   * @returns
   */
  public static getDetails() {
    const baseUrl = Settings.get<string>(SETTING_SITE_BASEURL);
    const editor = window.activeTextEditor;
    if (!editor) {
      return null;
    }

    if (!ArticleHelper.isSupportedFile()) {
      return null;
    }

    const article = ArticleHelper.getFrontMatter(editor);

    if (article && article.content) {
      let content = article.content;
      content = content.replace(/({{(.*?)}})/g, ''); // remove hugo shortcodes

      const mdTree = fromMarkdown(content);
      const elms: Parent[] | Link[] = this.getAllElms(mdTree);

      const headings = elms.filter((node) => node.type === 'heading');
      const paragraphs = elms.filter((node) => node.type === 'paragraph').length;
      const images = elms.filter((node) => node.type === 'image').length;
      const links: string[] = elms
        .filter((node) => node.type === 'link')
        .map((node) => (node as Link).url);

      const internalLinks = links.filter(
        (link) =>
          !link.startsWith('http') ||
          (baseUrl && link.toLowerCase().includes((baseUrl || '').toLowerCase()))
      ).length;
      let externalLinks = links.filter((link) => link.startsWith('http'));
      if (baseUrl) {
        externalLinks = externalLinks.filter(
          (link) => !link.toLowerCase().includes(baseUrl.toLowerCase())
        );
      }

      const headers = [];
      for (const header of headings) {
        const text = header?.children
          ?.filter((node: any) => node.type === 'text')
          .map((node: any) => node.value)
          .join(' ');
        if (text) {
          headers.push(text);
        }
      }

      const wordCount = this.wordCount(0, mdTree);

      return {
        headings: headings.length,
        headingsText: headers,
        paragraphs,
        images,
        internalLinks,
        externalLinks: externalLinks.length,
        wordCount,
        content: article.content
      };
    }

    return null;
  }

  /**
   * Retrieve all the elements from the markdown content
   * @param node
   * @param allElms
   * @returns
   */
  private static getAllElms(node: Content | any, allElms?: any[]): any[] {
    if (!allElms) {
      allElms = [];
    }

    if (node.children?.length > 0) {
      for (const child of node.children) {
        allElms.push(Object.assign({}, child));
        this.getAllElms(child, allElms);
      }
    }

    return allElms;
  }

  /**
   * Get the word count for the current document
   */
  private static wordCount(count: number, node: Content | any) {
    if (node.type === 'text') {
      return count + node.value.split(' ').length;
    } else {
      return (node.children || []).reduce(
        (childCount: number, childNode: any) => this.wordCount(childCount, childNode),
        count
      );
    }
  }

  /**
   * Parse a markdown file and its front matter
   * @param fileContents
   * @returns
   */
  private static parseFile(fileContents: string, fileName: string): ParsedFrontMatter | null {
    try {
      const commaSeparated = Settings.get<string[]>(SETTING_COMMA_SEPARATED_FIELDS);

      if (fileContents) {
        let article = FrontMatterParser.fromFile(fileContents);

        if (article?.data) {
          if (commaSeparated) {
            for (const key of commaSeparated) {
              if (article?.data[key] && typeof article.data[key] === 'string') {
                article.data[key] = article.data[key].split(',').map((s: string) => s.trim());
              }
            }
          }

          this.notifiedFiles = this.notifiedFiles.filter((n) => n !== fileName);

          if (window.activeTextEditor?.document.uri) {
            Extension.getInstance().diagnosticCollection.delete(
              window.activeTextEditor.document.uri
            );
          }

          return article;
        }
      }
    } catch (error: any) {
      const items = [
        {
          title: 'Check file',
          action: async () => {
            await EditorHelper.showFile(fileName);
          }
        }
      ];

      Logger.error(`ArticleHelper::parseFile: ${fileName} - ${error.message}`);

      const editor = window.activeTextEditor;
      if (editor?.document.uri) {
        let fmRange = null;

        if (error?.mark && typeof error.mark.line !== 'undefined') {
          const curLineText = editor.document.lineAt(error.mark.line - 1);
          const lastCharPos = new Position(
            error.mark.line - 1,
            Math.max(curLineText.text.length, 0)
          );
          fmRange = new Range(new Position(error.mark.line - 1, 0), lastCharPos);
        } else {
          fmRange = MarkdownFoldingProvider.getFrontMatterRange(editor.document);
        }

        if (fmRange) {
          Extension.getInstance().diagnosticCollection.set(editor.document.uri, [
            {
              severity: DiagnosticSeverity.Error,
              message: `${
                error.name ? `${error.name}: ` : ''
              }Error parsing the front matter of ${fileName}`,
              range: fmRange
            }
          ]);
        }
      }
    }
    return null;
  }
}
