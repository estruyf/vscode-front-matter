import { STATIC_FOLDER_PLACEHOLDER } from './../constants/StaticFolderPlaceholder';
import { PanelWebview } from './../PanelWebview/PanelWebview';
import { Uri, window } from 'vscode';
import { dirname, extname, join } from 'path';
import { Field } from '../models';
import { existsSync } from 'fs';
import { Folders } from '../commands/Folders';
import { parseWinPath } from './parseWinPath';
import { Preview } from '../commands';

export class ImageHelper {
  /**
   * Parse all images to use absolute paths
   * @param field
   * @param value
   * @returns
   */
  public static allRelToAbs(field: Field, value: string | string[] | undefined) {
    const filePath = window.activeTextEditor?.document.uri.fsPath || Preview.filePath;
    if (!filePath) {
      return;
    }

    let previewUri = null;

    if (field.multiple) {
      if (Array.isArray(value)) {
        previewUri = value.map((v) => ({
          original: v,
          absPath: v.startsWith('http') ? v : ImageHelper.relToAbs(filePath, v)
        }));
      }
    } else {
      if (typeof value === 'string') {
        return {
          original: value,
          absPath: value.startsWith('http') ? value : ImageHelper.relToAbs(filePath, value)
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
    let staticFolder = Folders.getStaticFolderRelativePath();

    if (staticFolder === STATIC_FOLDER_PLACEHOLDER.hexo.placeholder) {
      const editor = window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const filePath = parseWinPath(document.fileName);
        const pathWithoutExtension = filePath.replace(extname(filePath), '');
        const assetFilePath = join(pathWithoutExtension, value);

        if (existsSync(assetFilePath)) {
          return Uri.file(assetFilePath);
        }
      }
    }

    const staticPath = join(parseWinPath(wsFolder?.fsPath || ''), staticFolder || '', value);
    const contentFolderPath = filePath ? join(dirname(filePath), value) : null;
    const workspaceFolderPath = wsFolder ? join(wsFolder.fsPath, value) : null;

    if (existsSync(staticPath)) {
      return Uri.file(staticPath);
    } else if (contentFolderPath && existsSync(contentFolderPath)) {
      return Uri.file(contentFolderPath);
    } else if (workspaceFolderPath && existsSync(workspaceFolderPath)) {
      return Uri.file(workspaceFolderPath);
    }
  }

  /**
   * Parse absolute path to relative path
   * @param imgValue
   * @returns
   */
  public static absToRel(imgValue: string) {
    const wsFolder = Folders.getWorkspaceFolder();
    const staticFolder = Folders.getStaticFolderRelativePath();

    let relPath = imgValue || '';
    if (imgValue) {
      relPath = imgValue.split(parseWinPath(wsFolder?.fsPath || '')).pop() || '';
      relPath = imgValue.split(staticFolder || '').pop() || '';
    }
    return relPath;
  }

  /**
   * Process the image fields in the content type
   * @param updatedMetadata
   * @param fields
   * @param parents
   */
  public static processImageFields(updatedMetadata: any, fields: Field[], parents: string[] = []) {
    const imageFields = fields.filter((field) => field.type === 'image');
    const panel = PanelWebview.getInstance();

    // Support multi-level fields
    let parentObj = updatedMetadata;
    for (const parent of parents || []) {
      parentObj = parentObj[parent];
    }

    // Process image fields
    if (parentObj) {
      for (const field of imageFields) {
        if (parentObj[field.name]) {
          const imageData = ImageHelper.allRelToAbs(field, parentObj[field.name]);

          if (imageData) {
            if (field.multiple && imageData instanceof Array) {
              const preview = imageData.map((preview) =>
                preview && preview.absPath
                  ? {
                      ...preview,
                      webviewUrl:
                        typeof preview.absPath === 'string'
                          ? preview.absPath
                          : panel.getWebview()?.asWebviewUri(preview.absPath).toString()
                    }
                  : null
              );

              parentObj[field.name] = preview || [];
            } else if (!field.multiple && !Array.isArray(imageData) && imageData.absPath) {
              const preview =
                typeof imageData.absPath === 'string'
                  ? imageData.absPath
                  : panel.getWebview()?.asWebviewUri(imageData.absPath);
              parentObj[field.name] = {
                ...imageData,
                webviewUrl: preview ? preview.toString() : null
              };
            }
          } else {
            parentObj[field.name] = field.multiple ? [] : '';
          }
        }
      }

      // Check if there are sub-fields to process
      const subFields = fields.filter((field) => field.type === 'fields');
      if (subFields?.length > 0) {
        for (const field of subFields) {
          this.processImageFields(updatedMetadata, field.fields || [], [...parents, field.name]);
        }
      }
    }
  }
}
