import * as vscode from 'vscode';
import { ArticleHelper } from '../helpers';

export class StatusBar {
  
  /**
   * Update the text of the status bar
   * 
   * @param frontMatterStatusBar 
   */
  public static async showDraftStatus(frontMatterSB: vscode.StatusBarItem) {
    const draftMsg = "in draft";
    const publishMsg = "to publish";
    
    let editor = vscode.window.activeTextEditor;
    if (editor && editor.document && editor.document.languageId.toLowerCase() === "markdown") {
      try {
        const article = ArticleHelper.getFrontMatter(editor); 
        if (article && typeof article.data["draft"] !== "undefined") {
          console.log(`Draft status: ${article.data["draft"]}`);
          if (article.data["draft"] === true) {
            frontMatterSB.text = `$(book) ${draftMsg}`;
            frontMatterSB.show();
          } else if (article.data["draft"] === false) {
            frontMatterSB.text = `$(book) ${publishMsg}`;
            frontMatterSB.show();
          }
          return;
        }
      } catch (e) {
        // Nothing to do
      }
    }

    frontMatterSB.hide();
  }
}