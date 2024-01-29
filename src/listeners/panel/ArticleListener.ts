import { Article } from '../../commands';
import { ArticleHelper } from '../../helpers';
import { PostMessageData } from '../../models';
import { Command } from '../../panelWebView/Command';
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
        this.generateSlug(msg.payload);
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
  private static generateSlug({ title, slugTemplate }: { title: string; slugTemplate?: string }) {
    const article = ArticleHelper.getFrontMatterFromCurrentDocument();
    const slug = Article.generateSlug(title, article, slugTemplate);
    if (slug) {
      this.sendMsg(Command.updatedSlug, slug);
    }
  }
}
