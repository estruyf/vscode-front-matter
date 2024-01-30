import { Article } from '../../commands';
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
    }
  }

  /**
   * Generate a slug
   * @param title
   */
  private static generateSlug(
    command: CommandToCode,
    { title, slugTemplate }: { title: string; slugTemplate?: string },
    requestId?: string
  ) {
    if (!command || !requestId) {
      return;
    }

    const article = ArticleHelper.getFrontMatterFromCurrentDocument();
    const slug = Article.generateSlug(title, article, slugTemplate);
    if (slug) {
      this.sendRequest(command, requestId, slug);
    }
  }
}
