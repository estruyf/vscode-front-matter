import { GeneralCommands } from '../../constants';
import { PostMessageData } from '../../models';
import { BaseListener } from './BaseListener';
import { getLocalizationFile } from '../../utils/getLocalizationFile';
import { i18n } from '../../commands/i18n';

export class LocalizationListener extends BaseListener {
  /**
   * Process the messages
   * @param msg
   */
  public static process(msg: PostMessageData) {
    switch (msg.command) {
      case GeneralCommands.toVSCode.getLocalization:
        this.getLocalization();
        break;
      case GeneralCommands.toVSCode.content.locales:
        this.getContentLocales(msg.command, msg.requestId);
        break;
    }
  }

  public static async getLocalization() {
    const fileContents = await getLocalizationFile();

    this.sendMsg(GeneralCommands.toWebview.setLocalization as any, fileContents);
  }

  private static async getContentLocales(command: string, requestId?: string) {
    if (!command || !requestId) {
      return;
    }

    const config = i18n.getAll();
    this.sendRequest(command as any, requestId, config);
  }
}
