import * as vscode from 'vscode';
import { ArticleHelper } from '../helpers';

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

        // Check SEO of the title
        if (article && article.data && article.data.title) {
          const title: string = article.data.title;
          console.log(`Title length: ${title.length}`);
          if (title.length >= 60) {
            const text = editor.document.getText();
            
            const markdown = ArticleHelper.stringifyFrontMatter("", article.data);

            const txtIdx = text.indexOf(title);
            if (txtIdx !== -1 && txtIdx < markdown.length) {
              collection.clear();
              const posStart = editor.document.positionAt(txtIdx);
              const posEnd = editor.document.positionAt(txtIdx + 1 + title.length);
              
              collection.set(editor.document.uri, [{
                code: '',
                message: `Article title is longer than 60 characters (current length: ${title.length}). For SEO reasons, it would be better to make it less than 60 characters.`,
                range: new vscode.Range(posStart, posEnd),
                severity: vscode.DiagnosticSeverity.Warning,
                source: 'Front Matter'
              }]);
            } else {
              collection.clear();
            }
          } else {
            collection.clear();
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