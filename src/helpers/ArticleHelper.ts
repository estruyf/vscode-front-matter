import * as vscode from 'vscode';
import * as matter from "gray-matter";
import * as fs from "fs";
import { DefaultFields, SETTING_COMMA_SEPARATED_FIELDS, SETTING_DATE_FIELD, SETTING_DATE_FORMAT, SETTING_INDENT_ARRAY, SETTING_REMOVE_QUOTES } from '../constants';
import { DumpOptions } from 'js-yaml';
import { TomlEngine, getFmLanguage, getFormatOpts } from './TomlEngine';
import { SettingsHelper } from '.';
import { parse } from 'date-fns';
import { Notifications } from './Notifications';

export class ArticleHelper {
  
  /**
   * Get the contents of the current article
   * 
   * @param editor 
   */
  public static getFrontMatter(editor: vscode.TextEditor) {
    const fileContents = editor.document.getText();  
    return ArticleHelper.parseFile(fileContents);
  }

  /**
   * Retrieve the file's front matter by its path
   * @param filePath 
   */
  public static getFrontMatterByPath(filePath: string) {   
    const file = fs.readFileSync(filePath, { encoding: "utf-8" });
    return ArticleHelper.parseFile(file);
  }

  /**
   * Store the new information in the file
   * 
   * @param editor 
   * @param article 
   */
  public static async update(editor: vscode.TextEditor, article: matter.GrayMatterFile<string>) {
    const config = SettingsHelper.getConfig();
    const removeQuotes = config.get(SETTING_REMOVE_QUOTES) as string[];
    const commaSeparated = config.get<string[]>(SETTING_COMMA_SEPARATED_FIELDS);
    
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
    const config = SettingsHelper.getConfig();
    const indentArray = config.get(SETTING_INDENT_ARRAY) as boolean;
    const commaSeparated = config.get<string[]>(SETTING_COMMA_SEPARATED_FIELDS);

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

    const config = SettingsHelper.getConfig();
    const dateFormat = config.get(SETTING_DATE_FORMAT) as string;
    const dateField = config.get(SETTING_DATE_FIELD) as string || DefaultFields.PublishingDate;

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
   * Parse a markdown file and its front matter
   * @param fileContents 
   * @returns 
   */
  private static parseFile(fileContents: string): matter.GrayMatterFile<string> | null {
    try {
      const config = SettingsHelper.getConfig();
      const commaSeparated = config.get<string[]>(SETTING_COMMA_SEPARATED_FIELDS);
      
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
      Notifications.error(`There seems to be an issue parsing your Front Matter. ERROR: ${error.message || error}`);
    }
    return null;
  }
}