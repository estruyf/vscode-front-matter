import { Folders } from '../../commands';
import { SETTING_CUSTOM_SCRIPTS } from '../../constants';
import { CustomScript, Notifications, Settings } from '../../helpers';
import { CustomScript as ICustomScript, PostMessageData } from '../../models';
import { CommandToCode } from '../../panelWebView/CommandToCode';
import { BaseListener } from './BaseListener';

export class ScriptListener extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case CommandToCode.runCustomScript:
        this.runCustomScript(msg);
        break;
      case CommandToCode.runFieldAction:
        this.runFieldAction(msg);
        break;
    }
  }

  private static async runFieldAction({ command, payload, requestId }: PostMessageData) {
    if (!payload || !requestId || !command) {
      return;
    }

    const script = payload as ICustomScript;
    if (script.script) {
      const wsFolder = Folders.getWorkspaceFolder();
      if (!wsFolder) {
        return;
      }

      const fieldValue = await CustomScript.singleRun(wsFolder.fsPath, script);

      if (fieldValue) {
        this.sendRequest(command, requestId, fieldValue);
      } else {
        Notifications.error('The script did not return a field value');
        this.sendRequestError(command, requestId, 'The script did not return a field value');
      }
    }
  }

  /**
   * Run a custom script
   * @param msg
   */
  private static runCustomScript(msg: PostMessageData) {
    const scripts: ICustomScript[] | undefined = Settings.get(SETTING_CUSTOM_SCRIPTS);

    if (msg?.payload?.title && msg?.payload?.script && scripts) {
      const customScript = scripts.find((s: ICustomScript) => s.title === msg.payload.title);
      if (customScript?.script && customScript?.title) {
        CustomScript.run(customScript);
      }
    }
  }
}
