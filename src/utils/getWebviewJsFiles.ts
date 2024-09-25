import { readFileAsync } from './readFileAsync';
import { Uri, Webview } from 'vscode';
import { Extension } from '../helpers';

export const getWebviewJsFiles = async (name: string, webview: Webview) => {
  const context = Extension.getInstance();
  const extensionPath = context.extensionPath;
  const webviewFolder = Uri.joinPath(extensionPath, 'dist');
  const manifestPath = Uri.joinPath(webviewFolder, `${name}.manifest.json`);
  const manifest = await readFileAsync(manifestPath.fsPath, 'utf8');
  const manifestJson = JSON.parse(manifest);
  const entries = Object.entries<string>(manifestJson).filter(([key]) => key.endsWith('.js'));
  const files = entries.map(([_, value]) =>
    webview.asWebviewUri(Uri.joinPath(webviewFolder, value)).toString()
  );
  return files;
};
