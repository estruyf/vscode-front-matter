import { SETTING_SEO_DESCRIPTION_FIELD, SETTING_SEO_DESCRIPTION_LENGTH, SETTING_SEO_TITLE_LENGTH } from './../constants';
import * as vscode from 'vscode';
import { ArticleHelper, SeoHelper, Settings } from '../helpers';
import { ExplorerView } from '../explorerView/ExplorerView';
import { DefaultFields } from '../constants';
import { ContentType } from '../helpers/ContentType';

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

    const draft = ContentType.getDraftField();
    if (!draft || draft.type !== "boolean") {
      frontMatterSB.hide();
    }
    
    let editor = vscode.window.activeTextEditor;
    if (editor && ArticleHelper.isMarkdownFile()) {
      try {
        const article = ArticleHelper.getFrontMatter(editor);

        // Update the StatusBar based on the article draft state
        if (article && typeof article.data["draft"] !== "undefined") {
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

          // Retrieve the SEO config properties
          const titleLength = Settings.get(SETTING_SEO_TITLE_LENGTH) as number || -1;
          const descLength = Settings.get(SETTING_SEO_DESCRIPTION_LENGTH) as number || -1;
          const fieldName = Settings.get(SETTING_SEO_DESCRIPTION_FIELD) as string || DefaultFields.Description;
          
          if (article.data.title && titleLength > -1) {
            SeoHelper.checkLength(editor, collection, article, "title", titleLength);
          }
          
          if (article.data[fieldName] && descLength > -1) {
            SeoHelper.checkLength(editor, collection, article, fieldName, descLength);
          }
        }
        
        const panel = ExplorerView.getInstance();
        if (panel && panel.visible) {
          panel.pushMetadata(article!.data);
        }

        return;
      } catch (e) {
        // Nothing to do
      }
    } else {
      const panel = ExplorerView.getInstance();
      if (panel && panel.visible) {
        panel.pushMetadata(null);
      }
    }

    frontMatterSB.hide();
  }
}