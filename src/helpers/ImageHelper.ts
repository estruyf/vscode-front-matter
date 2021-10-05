import { Uri, window } from 'vscode'; 
import { dirname, join } from "path";
import { Field } from '../models';
import { existsSync } from 'fs';
import { Folders } from '../commands/Folders';
import { Settings } from './SettingsHelper';
import { SETTINGS_CONTENT_STATIC_FOLDER } from '../constants';
import { parseWinPath } from './parseWinPath';

export class ImageHelper {

  /**
   * Parse all images to use absolute paths
   * @param field 
   * @param value 
   * @returns 
   */
  public static allRelToAbs(field: Field, value: string | string[] | undefined) {
    const filePath = window.activeTextEditor?.document.uri.fsPath;
    if (!filePath) {
      return;
    }

    let previewUri = null;

    if (field.multiple) {
      if (Array.isArray(value)) {
        previewUri = value.map(v => ({
          original: v,
          absPath: ImageHelper.relToAbs(filePath, v)
        }));
      }
    } else {
      if (typeof value === "string") {
        return {
          original: value,
          absPath: ImageHelper.relToAbs(filePath, value)
        };
      }
    }

    return previewUri;
  }

  /**
   * Parse relative path to absolute path
   * @param filePath 
   * @param value 
   * @returns 
   */
   public static relToAbs(filePath: string, value: string) {
    const wsFolder = Folders.getWorkspaceFolder();
    const staticFolder = Settings.get<string>(SETTINGS_CONTENT_STATIC_FOLDER);

    const staticPath = join(parseWinPath(wsFolder?.fsPath || ""), staticFolder || "", value);
    const contentFolderPath = filePath ? join(dirname(filePath), value) : null;

    if (existsSync(staticPath)) {
      return Uri.file(staticPath);
    } else if (contentFolderPath && existsSync(contentFolderPath)) {
      return Uri.file(contentFolderPath);
    }
  }

  /**
   * Parse absolute path to relative path
   * @param imgValue 
   * @returns 
   */
  public static absToRel(imgValue: string) {
    const wsFolder = Folders.getWorkspaceFolder();
    const staticFolder = Settings.get<string>(SETTINGS_CONTENT_STATIC_FOLDER);

    let relPath = imgValue || "";
    if (imgValue) {
      relPath = imgValue.split(parseWinPath(wsFolder?.fsPath || "")).pop() || "";
      relPath = imgValue.split(staticFolder || "").pop() || "";
    }
    return relPath;
  }
}