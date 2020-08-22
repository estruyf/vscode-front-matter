import * as vscode from 'vscode';
import { ArticleHelper, SeoHelper } from '../helpers';

export class StatusListener {
  
  /**
   * Update the text of the status bar
   * 
   * @param frontMatterSB 
   * @param collection  
   */
  public static async verify(frontMatterSB: vscode.StatusBarItem, collection: vscode.DiagnosticCollection) {
    const draftMsg = "in draft";
    const publishMsg = "to publish";
    
    let editor = vscode.window.activeTextEditor;
    if (editor && editor.document && editor.document.languageId.toLowerCase() === "markdown") {
      try {
        const article = ArticleHelper.getFrontMatter(editor);

        // Update the StatusBar based on the article draft state
        if (article && typeof article.data["draft"] !== "undefined") {
          // console.log(`Draft status: ${article.data["draft"]}`);
          if (article.data["draft"] === true) {
            frontMatterSB.text = `$(book) ${draftMsg}`;
            frontMatterSB.show();
          } else if (article.data["draft"] === false) {
            frontMatterSB.text = `$(book) ${publishMsg}`;
            frontMatterSB.show();
          }
        }

        // Check SEO for title and description length
        if (article && article.data) {
          collection.clear();
          
          if (article.data.title) {
            SeoHelper.checkLength(editor, collection, article, "title", 60);
          }
          
          if (article.data.description) {
            SeoHelper.checkLength(editor, collection, article, "description", 140);
          }
        }
        return;
      } catch (e) {
        // Nothing to do
      }
    }

    frontMatterSB.hide();
  }
}