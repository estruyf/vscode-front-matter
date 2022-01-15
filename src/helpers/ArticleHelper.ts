import { MarkdownFoldingProvider } from './../providers/MarkdownFoldingProvider';
import { DEFAULT_CONTENT_TYPE, DEFAULT_CONTENT_TYPE_NAME } from './../constants/ContentType';
import * as vscode from 'vscode';
import * as matter from "gray-matter";
import * as fs from "fs";
import { DefaultFields, SETTINGS_CONTENT_DEFAULT_FILETYPE, SETTINGS_CONTENT_PLACEHOLDERS, SETTING_COMMA_SEPARATED_FIELDS, SETTING_DATE_FIELD, SETTING_DATE_FORMAT, SETTING_INDENT_ARRAY, SETTING_REMOVE_QUOTES, SETTING_TAXONOMY_CONTENT_TYPES, SETTING_TEMPLATES_PREFIX } from '../constants';
import { DumpOptions } from 'js-yaml';
import { TomlEngine, getFmLanguage, getFormatOpts } from './TomlEngine';
import { Extension, Settings } from '.';
import { format, parse } from 'date-fns';
import { Notifications } from './Notifications';
import { Article } from '../commands';
import { join } from 'path';
import { EditorHelper } from '@estruyf/vscode';
import sanitize from '../helpers/Sanitize';
import { existsSync, mkdirSync } from 'fs';
import { ContentType } from '../models';
import { DateHelper } from './DateHelper';
import { DiagnosticSeverity, Position, window, Range } from 'vscode';

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
   * Retrieve the file's front matter by its path
   * @param filePath 
   */
  public static getFrontMatterByPath(filePath: string) {   
    const file = fs.readFileSync(filePath, { encoding: "utf-8" });
    return ArticleHelper.parseFile(file, filePath);
  }

  /**
   * Store the new information in the file
   * 
   * @param editor 
   * @param article 
   */
  public static async update(editor: vscode.TextEditor, article: matter.GrayMatterFile<string>) {
    const update = this.generateUpdate(editor.document, article);

    await editor.edit(builder => builder.replace(update.range, update.newText));
  }

  /**
   * Generate the update to be applied to the article.
   * @param article 
   */
  public static generateUpdate(document: vscode.TextDocument, article: matter.GrayMatterFile<string>): vscode.TextEdit {
    const nrOfLines = document.lineCount as number;
    const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(nrOfLines, 0));
    const removeQuotes = Settings.get(SETTING_REMOVE_QUOTES) as string[];
    const commaSeparated = Settings.get<string[]>(SETTING_COMMA_SEPARATED_FIELDS);

    // Check if there is a line ending
    const lines = article.content.split("\n");
    const lastLine = lines.pop();
    const endsWithNewLine = lastLine !== undefined && lastLine.trim() === "";
    
    let newMarkdown = this.stringifyFrontMatter(article.content, Object.assign({}, article.data));

    // Logic to not include a new line at the end of the file
    if (!endsWithNewLine) {
      const lines = newMarkdown.split("\n");
      const lastLine = lines.pop();
      if (lastLine !== undefined && lastLine?.trim() === "") {
        newMarkdown = lines.join("\n");
      }
    }

    // Check for field where quotes need to be removed
    if (removeQuotes && removeQuotes.length) {
      for (const toRemove of removeQuotes) {
        if (article && article.data && article.data[toRemove]) {
          if (commaSeparated?.includes(toRemove)) {
            const textToReplace = article.data[toRemove].join(", ");
            newMarkdown = newMarkdown.replace(`'${textToReplace}'`, textToReplace);
            newMarkdown = newMarkdown.replace(`"${textToReplace}"`, textToReplace);
          } else {
            newMarkdown = newMarkdown.replace(`'${article.data[toRemove]}'`, article.data[toRemove]);
            newMarkdown = newMarkdown.replace(`"${article.data[toRemove]}"`, article.data[toRemove]);
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
   */
  public static stringifyFrontMatter(content: string, data: any) {
    const indentArray = Settings.get(SETTING_INDENT_ARRAY) as boolean;
    const commaSeparated = Settings.get<string[]>(SETTING_COMMA_SEPARATED_FIELDS);

    const language = getFmLanguage();
    const langOpts = getFormatOpts(language);

    const spaces = vscode.window.activeTextEditor?.options?.tabSize;

    if (commaSeparated) {
      for (const key of commaSeparated) {
        if (data[key] && typeof data[key] === "object") {
          data[key] = data[key].join(", ");
        }
      }
    }
    
    return matter.stringify(content, data, ({
      ...TomlEngine,
      ...langOpts,
      noArrayIndent: !indentArray,
      skipInvalid: true,
      noCompatMode: true,
      lineWidth: 500,
      indent: spaces || 2
    } as DumpOptions as any));
  }

  /**
   * Checks if the current file is a markdown file
   */ 
  public static isMarkdownFile(document: vscode.TextDocument | undefined | null = null) {
    const supportedLanguages = ["markdown", "mdx"];
    const supportedFileExtensions = [".md", ".mdx"];
    const languageId = document?.languageId?.toLowerCase();
    const isSupportedLanguage =  languageId && supportedLanguages.includes(languageId);
    document ??= vscode.window.activeTextEditor?.document;

    /**
     * It's possible that the file is a file type we support but the user hasn't installed
     * language support for. In that case, we'll manually check the extension as a proxy
     * for whether or not we support the file.
     */
    if (!isSupportedLanguage) {
      const fileName = document?.fileName?.toLowerCase();

      return fileName && supportedFileExtensions.findIndex(fileExtension => fileName.endsWith(fileExtension)) > -1;
    }
    
    return isSupportedLanguage;
  }

  /**
   * Get date from front matter
   */ 
  public static getDate(article: matter.GrayMatterFile<string> | null) {
    if (!article) {
      return;
    }

    const dateFormat = Settings.get(SETTING_DATE_FORMAT) as string;
    const dateField = Settings.get(SETTING_DATE_FIELD) as string || DefaultFields.PublishingDate;

    if (typeof article.data[dateField] !== "undefined") {
      if (dateFormat && typeof dateFormat === "string") {
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
   * Retrieve the content type of the current file
   * @param updatedMetadata 
   */
  public static getContentType(metadata: { [field: string]: string; }): ContentType {
    const contentTypes = Settings.get<ContentType[]>(SETTING_TAXONOMY_CONTENT_TYPES);

    if (!contentTypes || !metadata) {
      return DEFAULT_CONTENT_TYPE;
    }

    let contentType = contentTypes.find(ct => ct.name === (metadata.type || DEFAULT_CONTENT_TYPE_NAME));
    if (!contentType) {
      contentType = contentTypes.find(ct => ct.name === DEFAULT_CONTENT_TYPE_NAME);
    }
    return contentType || DEFAULT_CONTENT_TYPE;
  }

  /**
   * Update all dates in the metadata
   * @param metadata 
   */
  public static updateDates(metadata: { [field: string]: string; }) {
    const contentType = ArticleHelper.getContentType(metadata);
    const dateFields = contentType.fields.filter((field) => field.type === "datetime");

    for (const dateField of dateFields) {
      if (typeof metadata[dateField.name] !== "undefined") {
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
    return sanitize(value.toLowerCase().replace(/ /g, "-"));
  }

  /**
   * Create the file or folder for the new content
   * @param contentType 
   * @param folderPath 
   * @param titleValue 
   * @returns The new file path
   */
  public static createContent(contentType: ContentType | undefined, folderPath: string, titleValue: string, fileExtension?: string): string | undefined {
    const prefix = Settings.get<string>(SETTING_TEMPLATES_PREFIX);
    const fileType = Settings.get<string>(SETTINGS_CONTENT_DEFAULT_FILETYPE);
    
    // Name of the file or folder to create
    const sanitizedName = ArticleHelper.sanitize(titleValue);
    let newFilePath: string | undefined;

    // Create a folder with the `index.md` file
    if (contentType?.pageBundle) {
      const newFolder = join(folderPath, sanitizedName);
      if (existsSync(newFolder)) {
        Notifications.error(`A page bundle with the name ${sanitizedName} already exists in ${folderPath}`);
        return;
      } else {
        mkdirSync(newFolder);
        newFilePath = join(newFolder, `index.${fileExtension || contentType.fileType || fileType}`);
      }
    } else {
      let newFileName = `${sanitizedName}.${fileExtension || contentType?.fileType || fileType}`;

      if (prefix && typeof prefix === "string") {
        newFileName = `${format(new Date(), DateHelper.formatUpdate(prefix) as string)}-${newFileName}`;
      }
      
      newFilePath = join(folderPath, newFileName);

      if (existsSync(newFilePath)) {
        Notifications.warning(`Content with the title already exists. Please specify a new title.`);
        return;
      }
    }

    return newFilePath;
  }

  /**
   * Update placeholder values in the front matter content
   * @param data 
   * @param title 
   * @returns 
   */
  public static updatePlaceholders(data: any, title: string) {
    const fmData = Object.assign({}, data);

    for (const fieldName of Object.keys(fmData)) {
      const fieldValue = fmData[fieldName];

      if (fieldName === "title" && (fieldValue === null || fieldValue === "")) {
        fmData[fieldName] = title;
      }
  
      if (fieldName === "slug" && (fieldValue === null || fieldValue === "")) {
        fmData[fieldName] = ArticleHelper.sanitize(title);
      }

      fmData[fieldName] = this.processKnownPlaceholders(fmData[fieldName], title);
      fmData[fieldName] = this.processCustomPlaceholders(fmData[fieldName], title);
    }

    return fmData;
  }

  /**
   * Replace the known placeholders
   * @param value 
   * @param title 
   * @returns 
   */
  public static processKnownPlaceholders(value: string, title: string) {
    if (value && typeof value === "string") {
      if (value.includes("{{title}}")) {
        const regex = new RegExp("{{title}}", "g");
        value = value.replace(regex, title);
      }
      
      if (value.includes("{{slug}}")) {
        const regex = new RegExp("{{slug}}", "g");
        value = value.replace(regex, ArticleHelper.sanitize(title));
      }
    }

    return value;
  }

  /**
   * Replace the custom placeholders
   * @param value 
   * @param title 
   * @returns 
   */
  public static processCustomPlaceholders(value: string, title: string) {
    if (value && typeof value === "string") {
      const placeholders = Settings.get<{id: string, value: string}[]>(SETTINGS_CONTENT_PLACEHOLDERS);
      if (placeholders && placeholders.length > 0) {
        for (const placeholder of placeholders) {
          if (value.includes(`{{${placeholder.id}}}`)) {
            const regex = new RegExp(`{{${placeholder.id}}}`, "g");
            const updatedValue = this.processKnownPlaceholders(placeholder.value, title);
            value = value.replace(regex, updatedValue);
          }
        }
      }
    }

    return value;
  }

  /**
   * Parse a markdown file and its front matter
   * @param fileContents 
   * @returns 
   */
  private static parseFile(fileContents: string, fileName: string): matter.GrayMatterFile<string> | null {
    try {
      const commaSeparated = Settings.get<string[]>(SETTING_COMMA_SEPARATED_FIELDS);
      
      if (fileContents) {
        const language: string = getFmLanguage(); 
        const langOpts = getFormatOpts(language);
        let article: matter.GrayMatterFile<string> | null = matter(fileContents, {
          ...TomlEngine,
          ...langOpts
        });
  
        if (article?.data) {
          if (commaSeparated) {
            for (const key of commaSeparated) {
              if (article?.data[key] && typeof article.data[key] === "string") {
                article.data[key] = article.data[key].split(",").map((s: string) => s.trim());
              }
            }
          }

          this.notifiedFiles = this.notifiedFiles.filter(n => n !== fileName);

          if (window.activeTextEditor?.document.uri) {
            Extension.getInstance().diagnosticCollection.delete(window.activeTextEditor.document.uri);
          }

          return article;
        }
      }
    } catch (error: any) {
      const items = [{ 
        title: "Check file", 
        action: async () => {
          await EditorHelper.showFile(fileName)
        } 
      }];

      const editor = window.activeTextEditor;
      if (editor?.document.uri) {
        let fmRange = null;

        if (error?.mark && typeof error.mark.line !== "undefined") {
          const curLineText = editor.document.lineAt(error.mark.line - 1);
          const lastCharPos = new Position(error.mark.line - 1, Math.max(curLineText.text.length, 0));
          fmRange = new Range(new Position(error.mark.line - 1, 0), lastCharPos);
        } else {
          fmRange = MarkdownFoldingProvider.getFrontMatterRange(editor.document);
        }


        if (fmRange) {
          Extension.getInstance().diagnosticCollection.set(editor.document.uri, [{
            severity: DiagnosticSeverity.Error,
            message: `${error.name ? `${error.name}: ` : ""}Error parsing the front matter of ${fileName}`,
            range: fmRange
          }]);
        }
      }
    }
    return null;
  }
}