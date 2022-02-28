import { Article } from "../../commands";
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
        Article.generateSlug();
        break;
      case CommandToCode.updateLastMod:
        Article.setLastModifiedDate();
        break;
      case CommandToCode.publish:
        Article.toggleDraft();
        break;
    }
  }
}