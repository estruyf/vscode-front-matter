import { Uri, workspace, window } from 'vscode';
import { Logger } from './Logger';
import { Notifications } from './Notifications';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';
import { Folders, WORKSPACE_PLACEHOLDER } from '../commands';

export const openFileInEditor = async (filePath: string) => {
  if (filePath) {
    if (filePath.startsWith(WORKSPACE_PLACEHOLDER)) {
      filePath = Folders.getAbsFilePath(filePath);
    }

    try {
      const doc = await workspace.openTextDocument(Uri.file(filePath));
      await window.showTextDocument(doc, 1, false);
    } catch (e) {
      Notifications.error(l10n.t(LocalizationKey.helpersOpenFileInEditorError));
      Logger.error(`${filePath}: ${(e as Error).message}`);
    }
  }
};
