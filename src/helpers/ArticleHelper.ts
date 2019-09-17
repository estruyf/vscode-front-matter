import * as vscode from 'vscode';
import * as matter from "gray-matter";
import { stopWords } from '../constants/stopwords-en';
import { charMap } from '../constants/charMap';
import { CONFIG_KEY, SETTING_INDENT_ARRAY, SETTING_DATE_FORMAT, SETTING_REMOVE_QUOTES } from '../constants';
import { DumpOptions } from 'js-yaml';

export class ArticleHelper {
  
  /**
   * Get the contents of the current article
   * 
   * @param editor 
   */
  public static getFrontMatter(editor: vscode.TextEditor) {
    const article = matter(editor.document.getText());
    if (article && article.data) {
      return article;
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
    const indentArray = config.get(SETTING_INDENT_ARRAY) as boolean;
    const removeQuotes = config.get(SETTING_REMOVE_QUOTES) as string[];

    let newMarkdown = matter.stringify(article.content, article.data, ({
      noArrayIndent: !indentArray
    } as DumpOptions as any));

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
   * Generate the slug
   * 
   * @param articleTitle 
   */
  static createSlug(articleTitle: string): string | null {
    if (!articleTitle) {
      return null;
    }

    // Remove punctuation from input string, and split it into words.
    let cleanTitle = this.removePunctuation(articleTitle);
    cleanTitle = cleanTitle.toLowerCase();
    // Split into words
    let words = cleanTitle.split(/\s/);
    // Removing stop words
    words = this.removeStopWords(words);
    cleanTitle = words.join("-");
    cleanTitle = this.replaceCharacters(cleanTitle);
    return cleanTitle;
  }

  /**
   * Remove  links, periods, commas, semi-colons, etc.
   * 
   * @param value 
   */
  private static removePunctuation(value: string): string {
    const punctuationless = value.replace(/[\.,-\/#!$@%\^&\*;:{}=\-_`'"~()+\?<>]/g, " ");
    // Remove double spaces
    return punctuationless.replace(/\s{2,}/g," ");
  }

  /**
   * Remove stop words
   * 
   * @param words 
   */
  private static removeStopWords(words: string[]) {
    const validWords: string[] = [];
    for (const word of words) {
      if (stopWords.indexOf(word.toLowerCase()) === -1) {
        validWords.push(word);
      }
    }
    return validWords;
  }

  /**
   * Replace characters from title
   * 
   * @param value 
   */
  private static replaceCharacters(value: string) {
    const characters = [...value];
    return characters.map(c => charMap[c] || c).join("");
  }
}