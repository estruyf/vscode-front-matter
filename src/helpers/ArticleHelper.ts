import * as vscode from 'vscode';
import * as matter from "gray-matter";
import * as fs from "fs";
import { CONFIG_KEY, SETTING_INDENT_ARRAY, SETTING_REMOVE_QUOTES } from '../constants';
import { DumpOptions } from 'js-yaml';
import { TomlEngine, getFmLanguage, getFormatOpts } from './TomlEngine';

export class ArticleHelper {
  
  /**
   * Get the contents of the current article
   * 
   * @param editor 
   */
  public static getFrontMatter(editor: vscode.TextEditor) {   
    const language: string = getFmLanguage(); 
    const langOpts = getFormatOpts(language);
    let article: matter.GrayMatterFile<string> | null = matter(editor.document.getText(), {
      ...TomlEngine,
      ...langOpts
    });

    if (article && article.data) {
      return article;
    }
    return null;
  }

  /**
   * Retrieve the file's front matter by its path
   * @param filePath 
   */
  public static getFrontMatterByPath(filePath: string) {   
    const file = fs.readFileSync(filePath, { encoding: "utf-8" });
    if (file) {
      const language: string = getFmLanguage(); 
      const langOpts = getFormatOpts(language);
      let article: matter.GrayMatterFile<string> | null = matter(file, {
        ...TomlEngine,
        ...langOpts
      });
  
      if (article && article.data) {
        return article;
      }
    }
    return null;
  }

  /**
   * Store the new information in the file
   * 
   * @param editor 
   * @param article 
   */
  public static async update(editor: vscode.TextEditor, article: matter.GrayMatterFile<string>) {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);
    const removeQuotes = config.get(SETTING_REMOVE_QUOTES) as string[];
    
    let newMarkdown = this.stringifyFrontMatter(article.content, article.data);

    // Check for field where quotes need to be removed
    if (removeQuotes && removeQuotes.length) {
      for (const toRemove of removeQuotes) {
        if (article && article.data && article.data[toRemove]) {
          newMarkdown = newMarkdown.replace(`'${article.data[toRemove]}'`, article.data[toRemove]);
          newMarkdown = newMarkdown.replace(`"${article.data[toRemove]}"`, article.data[toRemove]);
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
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);
    const indentArray = config.get(SETTING_INDENT_ARRAY) as boolean;

    const language = getFmLanguage();
    const langOpts = getFormatOpts(language);

    const spaces = vscode.window.activeTextEditor?.options?.tabSize;

    return matter.stringify(content, data, ({
      ...TomlEngine,
      ...langOpts,
      noArrayIndent: !indentArray,
      lineWidth: 500,
      indent: spaces || 2
    } as DumpOptions as any));
  }
}