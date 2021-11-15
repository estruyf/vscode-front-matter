import { DEFAULT_CONTENT_TYPE, DEFAULT_CONTENT_TYPE_NAME } from './../constants/ContentType';
import * as vscode from 'vscode';
import * as matter from "gray-matter";
import * as fs from "fs";
import { DefaultFields, SETTING_COMMA_SEPARATED_FIELDS, SETTING_DATE_FIELD, SETTING_DATE_FORMAT, SETTING_INDENT_ARRAY, SETTING_REMOVE_QUOTES, SETTING_TAXONOMY_CONTENT_TYPES, SETTING_TEMPLATES_PREFIX } from '../constants';
import { DumpOptions } from 'js-yaml';
import { TomlEngine, getFmLanguage, getFormatOpts } from './TomlEngine';
import { Settings } from '.';
import { format, parse } from 'date-fns';
import { Notifications } from './Notifications';
import { Article } from '../commands';
import { basename, join } from 'path';
import { EditorHelper } from '@estruyf/vscode';
import sanitize from '../helpers/Sanitize';
import { existsSync, mkdirSync } from 'fs';
import { ContentType } from '../models';
import { DateHelper } from './DateHelper';

export class ArticleHelper {
  
  /**
   * Get the contents of the current article
   * 
   * @param editor 
   */
  public static getFrontMatter(editor: vscode.TextEditor) {
    const fileContents = editor.document.getText();  
    return ArticleHelper.parseFile(fileContents, editor.document.fileName);
  }

  /**
   * Retrieve the file's front matter by its path
   * @param filePath 
   */
  public static getFrontMatterByPath(filePath: string, surpressNotification: boolean = false) {   
    const file = fs.readFileSync(filePath, { encoding: "utf-8" });
    return ArticleHelper.parseFile(file, filePath, surpressNotification);
  }

  /**
   * Store the new information in the file
   * 
   * @param editor 
   * @param article 
   */
  public static async update(editor: vscode.TextEditor, article: matter.GrayMatterFile<string>) {
    const removeQuotes = Settings.get(SETTING_REMOVE_QUOTES) as string[];
    const commaSeparated = Settings.get<string[]>(SETTING_COMMA_SEPARATED_FIELDS);
    
    let newMarkdown = this.stringifyFrontMatter(article.content, Object.assign({}, article.data));

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

    const nrOfLines = editor.document.lineCount as number;
    await editor.edit(builder => builder.replace(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(nrOfLines, 0)), newMarkdown));
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
  public static isMarkdownFile() {
    const editor = vscode.window.activeTextEditor;
    return (editor && editor.document && (editor.document.languageId.toLowerCase() === "markdown" || editor.document.languageId.toLowerCase() === "mdx"));
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
  public static createContent(contentType: ContentType | undefined, folderPath: string, titleValue: string): string | undefined {
    const prefix = Settings.get<string>(SETTING_TEMPLATES_PREFIX);
    
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
        newFilePath = join(newFolder, `index.md`);
      }
    } else {
      let newFileName = `${sanitizedName}.md`;

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
   * Parse a markdown file and its front matter
   * @param fileContents 
   * @returns 
   */
  private static parseFile(fileContents: string, fileName: string, surpressNotification: boolean = false): matter.GrayMatterFile<string> | null {
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

      if (!surpressNotification) {
        Notifications.error(`There seems to be an issue parsing the content its front matter. FileName: ${basename(fileName)}. ERROR: ${error.message || error}`, ...items).then((result: any) => {
          if (result?.title) {
            const item = items.find(i => i.title === result.title);
            if (item) {
              item.action();
            }
          }
        });
      }
    }
    return null;
  }
}