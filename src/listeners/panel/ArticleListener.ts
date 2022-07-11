import { Article } from "../../commands";
import { Command } from "../../panelWebView/Command";
import { CommandToCode } from "../../panelWebView/CommandToCode";
import { BaseListener } from "./BaseListener";


export class ArticleListener extends BaseListener {

  /**
   * Process the messages for the dashboard views
   * @param msg 
   */
  public static process(msg: { command: any, data: any }) {
    super.process(msg);

    switch(msg.command) {
      case CommandToCode.updateSlug:
        Article.updateSlug();
        break;
      case CommandToCode.generateSlug:
        this.generateSlug(msg.data);
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
  private static generateSlug(title: string) {
    const slug = Article.generateSlug(title);
    if (slug) {
      this.sendMsg(Command.updatedSlug, slug)
    }
  }
}