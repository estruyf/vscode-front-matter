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
        this.getLocalization();
        break;
    }
  }

  public static async getLocalization() {
    const fileContents = await getLocalizationFile();

    this.sendMsg(GeneralCommands.toWebview.setLocalization as any, fileContents);
  }
}
