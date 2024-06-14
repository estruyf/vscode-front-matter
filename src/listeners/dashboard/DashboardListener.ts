import { Dashboard } from '../../commands/Dashboard';
import { ExtensionState } from '../../constants';
import { DashboardCommand } from '../../dashboardWebView/DashboardCommand';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { Extension, Notifications, Settings } from '../../helpers';
import { PostMessageData } from '../../models';
import { PinnedItems } from '../../services';
import { BaseListener } from './BaseListener';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';
import { Uri, commands } from 'vscode';
import { existsAsync } from '../../utils';

export class DashboardListener extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case DashboardMessage.setTitle:
        Dashboard.setTitle(msg.payload);
        break;
      case DashboardMessage.getViewType:
        if (Dashboard.viewData) {
          this.sendMsg(DashboardCommand.viewData, Dashboard.viewData);
        }
        break;
      case DashboardMessage.reload:
        Dashboard.reload();
        break;
      case DashboardMessage.setPageViewType:
        Extension.getInstance().setState(ExtensionState.PagesView, msg.payload, 'workspace');
        break;
      case DashboardMessage.openConfig:
        this.openConfig();
        break;
      case DashboardMessage.showWarning:
        Notifications.warning(msg.payload);
        break;
      case DashboardMessage.pinItem:
        DashboardListener.pinItem(msg);
        break;
      case DashboardMessage.unpinItem:
        DashboardListener.unpinItem(msg);
        break;
      case DashboardMessage.getPinnedItems:
        DashboardListener.getPinnedItems(msg);
        break;
      case DashboardMessage.showNotification:
        if (msg.payload) {
          Notifications.info(msg.payload);
        }
        break;
    }
  }

  private static async openConfig() {
    const answer = await Notifications.info(
      l10n.t(LocalizationKey.listenersDashboardDashboardListenerOpenConfigNotification),
      l10n.t(LocalizationKey.commonOpenSettings)
    );

    if (answer && answer === l10n.t(LocalizationKey.commonOpenSettings)) {
      const configPath = await Settings.projectConfigPath();

      if (configPath && (await existsAsync(configPath))) {
        commands.executeCommand('vscode.open', Uri.file(configPath));
      }
    }
  }

  /**
   * Get the pinned items
   * @param msg
   */
  private static async getPinnedItems({ command, requestId }: PostMessageData) {
    if (!requestId || !command) {
      return;
    }

    const allPinned = (await PinnedItems.get()) || [];
    this.sendRequest(command as any, requestId, allPinned);
  }

  /**
   * Pin an item to the dashboard
   * @param payload
   */
  private static async pinItem({ command, requestId, payload }: PostMessageData) {
    if (!requestId || !command || !payload) {
      return;
    }

    const path = payload;
    if (!path) {
      this.sendError(
        command as any,
        requestId,
        l10n.t(LocalizationKey.listenersDashboardDashboardListenerPinItemNoPathError)
      );
      return;
    }

    const allPinned = await PinnedItems.pin(path);

    if (!allPinned) {
      this.sendError(
        command as any,
        requestId,
        l10n.t(LocalizationKey.listenersDashboardDashboardListenerPinItemCoundNotPinError)
      );
      return;
    }

    this.sendRequest(command as any, requestId, allPinned);
  }

  /**
   * Unpin an item from the dashboard
   * @param param0
   * @returns
   */
  private static async unpinItem({ command, requestId, payload }: PostMessageData) {
    if (!requestId || !command || !payload) {
      return;
    }

    const path = payload;
    if (!path) {
      this.sendError(
        command as any,
        requestId,
        l10n.t(LocalizationKey.listenersDashboardDashboardListenerPinItemNoPathError)
      );
      return;
    }

    const updatedPinned = await PinnedItems.remove(path);

    if (!updatedPinned) {
      this.sendError(
        command as any,
        requestId,
        l10n.t(LocalizationKey.listenersDashboardDashboardListenerPinItemCoundNotUnPinError)
      );
      return;
    }

    this.sendRequest(command as any, requestId, updatedPinned);
  }
}
