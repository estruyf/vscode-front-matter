import { DEFAULT_CONTENT_TYPE, DEFAULT_CONTENT_TYPE_NAME } from './../constants/ContentType';
import { ContentType } from './../models/PanelSettings';
import * as vscode from 'vscode';
import * as matter from "gray-matter";
import * as fs from "fs";
import { DefaultFields, SETTING_COMMA_SEPARATED_FIELDS, SETTING_DATE_FIELD, SETTING_DATE_FORMAT, SETTING_INDENT_ARRAY, SETTING_REMOVE_QUOTES, SETTING_TAXONOMY_CONTENT_TYPES } from '../constants';
import { DumpOptions } from 'js-yaml';
import { TomlEngine, getFmLanguage, getFormatOpts } from './TomlEngine';
import { Settings } from '.';
import { parse } from 'date-fns';
import { Notifications } from './Notifications';
import { Article } from '../commands';
import { basename } from 'path';
import { EditorHelper } from '@estruyf/vscode';

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

          return article;
        }
      }
    } catch (error: any) {
      const items = [{ 
        title: "Check file", 
        action: async () => {
          console.log(fileName);
          await EditorHelper.showFile(fileName)
        } 
      }];
      
      Notifications.error(`There seems to be an issue parsing the content its front matter. FileName: ${basename(fileName)}. ERROR: ${error.message || error}`, ...items).then((result: any) => {
        if (result?.title) {
          const item = items.find(i => i.title === result.title);
          if (item) {
            item.action();
          }
        }
      });
    }
    return null;
  }
}