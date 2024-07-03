import { Uri, Webview } from 'vscode';
import { Folders } from '../commands';
import { SETTING_EXTENSIBILITY_SCRIPTS } from '../constants';
import { Settings } from '../helpers';

export const getExtensibilityScripts = (webview: Webview) => {
  const extensibilityScripts = Settings.get<string[]>(SETTING_EXTENSIBILITY_SCRIPTS) || [];

  const scriptsToLoad: string[] = [];
  for (const script of extensibilityScripts) {
    if (script.startsWith('https://')) {
      scriptsToLoad.push(script);
    } else {
      const absScriptPath = Folders.getAbsFilePath(script);
      const scriptUri = webview.asWebviewUri(Uri.file(absScriptPath));
      scriptsToLoad.push(scriptUri.toString());
    }
  }

  return scriptsToLoad;
};
