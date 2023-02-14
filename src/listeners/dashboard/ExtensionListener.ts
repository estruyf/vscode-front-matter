import { commands, env } from 'vscode';
import { SettingsListener } from '.';
import { COMMAND_NAME } from '../../constants';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { CustomScript, Extension } from '../../helpers';
import { openFileInEditor } from '../../helpers/openFileInEditor';
import { BaseListener } from './BaseListener';

export class ExtensionListener extends BaseListener {
  public static process(msg: { command: DashboardMessage; data: any }) {
    super.process(msg);

    switch (msg.command) {
      case DashboardMessage.openFile:
        openFileInEditor(msg.data);
        break;
      case DashboardMessage.initializeProject:
        commands.executeCommand(COMMAND_NAME.init, SettingsListener.getSettings);
        break;
      case DashboardMessage.copyToClipboard:
        env.clipboard.writeText(msg.data);
        break;
      case DashboardMessage.runCustomScript:
        CustomScript.run(msg?.data?.script, msg?.data?.path);
        break;
      case DashboardMessage.setState:
        this.setState(msg?.data);
        break;
    }
  }

  private static setState(data: any) {
    const { key, value } = data;
    if (key && value) {
      Extension.getInstance().setState(key, value, 'workspace');
    }
  }
}
