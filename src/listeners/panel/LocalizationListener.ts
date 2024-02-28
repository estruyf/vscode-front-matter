import { GeneralCommands } from '../../constants';
import { PostMessageData } from '../../models';
import { BaseListener } from './BaseListener';
import { getLocalizationFile } from '../../utils/getLocalizationFile';

export class LocalizationListener extends BaseListener {
  /**
   * Process the messages
   * @param msg
   */
  public static process(msg: PostMessageData) {
    switch (msg.command) {
      case GeneralCommands.toVSCode.getLocalization:
        this.getLocalization(msg.command, msg.requestId);
        break;
    }
  }

  public static async getLocalization(command: string, requestId?: string) {
    if (!command || !requestId) {
      return;
    }

    const fileContents = await getLocalizationFile();
    this.sendRequest(command, requestId, fileContents);
  }
}
