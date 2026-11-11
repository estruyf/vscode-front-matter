import { Article, Preview } from '../../commands';
import { ArticleHelper } from '../../helpers';
import { PostMessageData } from '../../models';
import { CommandToCode } from '../../panelWebView/CommandToCode';
import { BaseListener } from './BaseListener';

export class ArticleListener extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case CommandToCode.updateSlug:
        Article.updateSlug();
        break;
      case CommandToCode.generateSlug:
        this.generateSlug(msg.command, msg.payload, msg.requestId);
        break;
      case CommandToCode.updateLastMod:
        Article.setLastModifiedDate();
        break;
      case CommandToCode.publish:
        Article.toggleDraft();
        break;
      case CommandToCode.smartRename:
        ArticleHelper.smartRename();
        break;
    }
  }

  /**
   * Generate a slug
   * @param title
   */
  private static async generateSlug(
    command: CommandToCode,
    { title, slugTemplate }: { title: string; slugTemplate?: string },
    requestId?: string
  ) {
    if (!command || !requestId) {
      return;
    }

    // Without an active text editor, the panel shows the previewed file
    let article = ArticleHelper.getFrontMatterFromCurrentDocument();
    if (!article && Preview.filePath) {
      article = await ArticleHelper.getFrontMatterByPath(Preview.filePath);
    }

    const slug = Article.generateSlug(title, article, article?.path, slugTemplate);
    if (slug) {
      this.sendRequest(command, requestId, slug);
    } else {
      this.sendRequestError(command, requestId, 'Failed to generate the slug');
    }
  }
}
