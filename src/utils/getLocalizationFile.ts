import { Uri, l10n } from 'vscode';
import { Extension, Logger, parseWinPath } from '../helpers';
import { readFileAsync } from './readFileAsync';
import { join } from 'path';

export const getLocalizationFile = async () => {
  try {
    const localeFilePath =
      l10n.uri?.fsPath ||
      Uri.file(join(parseWinPath(Extension.getInstance().extensionPath.fsPath), `/l10n/bundle.l10n.json`)).fsPath;

    const fileContents = await readFileAsync(localeFilePath, 'utf-8');
    return fileContents;
  } catch (error) {
    Logger.error(`Failed to get the localization file: ${(error as Error).message}`);
    return '';
  }
};
