import { readdirSync } from 'fs';
import { Extension } from './Extension';
import { Notifications } from './Notifications';

export class Media {

  public static async optimize(file: string, quality: number = 0.8) {
    if (!file) {
      Notifications.warning('No file provided');
      return;
    }

    Notifications.info(readdirSync(Extension.getInstance().extensionPath.fsPath).join(","));
  }
}