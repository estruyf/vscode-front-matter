import { Uri, workspace, window } from 'vscode';
import { Logger } from './Logger';
import { Notifications } from './Notifications';

export const openFileInEditor = async (filePath: string) => {
  if (filePath) {
    try {
      const doc = await workspace.openTextDocument(Uri.file(filePath));
      await window.showTextDocument(doc, 1, false);
    } catch (e) {
      Notifications.error(`Couldn't open the file.`);
      Logger.error(`${filePath}: ${(e as Error).message}`);
    }
  }
};
