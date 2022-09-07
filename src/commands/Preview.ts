import { Telemetry } from './../helpers/Telemetry';
import { SETTING_PREVIEW_HOST, SETTING_PREVIEW_PATHNAME, CONTEXT, TelemetryEvent, PreviewCommands } from './../constants';
import { ArticleHelper } from './../helpers/ArticleHelper';
import { join } from "path";
import { commands, env, Uri, ViewColumn, window } from "vscode";
import { Extension, parseWinPath, Settings } from '../helpers';
import { ContentFolder, PreviewSettings } from '../models';
import { format } from 'date-fns';
import { DateHelper } from '../helpers/DateHelper';
import { Article } from '.';
import { urlJoin } from 'url-join-ts';
import { WebviewHelper } from '@estruyf/vscode';
import { Folders } from './Folders';


export class Preview {

  /**
   * Init the preview
   */
  public static async init() {
    const settings = Preview.getSettings();
    await commands.executeCommand('setContext', CONTEXT.canOpenPreview, !!settings.host);
  }
  
  /**
   * Open the markdown preview in the editor
   */
  public static async open(extensionPath: string) {
    const settings = Preview.getSettings();

    if (!settings.host) {
      return;
    }
    
    const editor = window.activeTextEditor;
    const article = editor ? ArticleHelper.getFrontMatter(editor) : null;
    let slug = article?.data ? article.data.slug : "";

    let pathname = settings.pathname;

    // Check if there is a pathname defined on content folder level
    const folders = Folders.get();
    if (folders.length > 0) {
      const foldersWithPath = folders.filter(folder => folder.previewPath);
      const filePath = parseWinPath(editor?.document.uri.fsPath);

      let selectedFolder: ContentFolder | null = null;
      for (const folder of foldersWithPath) {
        const folderPath = parseWinPath(folder.path);
        if (filePath.startsWith(folderPath)) {
          if (!selectedFolder || selectedFolder.path.length < folderPath.length) {
            selectedFolder = folder;
          }
        }
      }

      if (selectedFolder) {
        pathname = selectedFolder.previewPath;
      }
    }

    // Check if there is a pathname defined on content type level
    if (article?.data) {
      const contentType = ArticleHelper.getContentType(article.data);
      if (contentType && contentType.previewPath) {
        pathname = contentType.previewPath;
      }
    }

    if (!slug) {
      slug = Article.getSlug();
    }

    if (pathname) {
      const articleDate = ArticleHelper.getDate(article);

      try {
        slug = join(format(articleDate || new Date(), DateHelper.formatUpdate(pathname) as string), slug);
      } catch (error) {
        slug = join(pathname, slug);
      }
    }

    // Make sure there are no backslashes in the slug
    slug = parseWinPath(slug);

    // Verify if the slug doesn't end with _index or index
    if (slug.endsWith('_index') || slug.endsWith('index')) {
      slug = slug.substring(0, slug.endsWith('_index') ? slug.length - 6 : slug.length - 5);
    }

    // Create the preview webview
    const webView = window.createWebviewPanel(
      'frontMatterPreview',
      'FrontMatter Preview',
      {
        viewColumn: ViewColumn.Beside,
        preserveFocus: true
      },
      {
        enableScripts: true
      }
    );

    webView.iconPath = {
      dark: Uri.file(join(extensionPath, 'assets/icons/frontmatter-short-dark.svg')),
      light: Uri.file(join(extensionPath, 'assets/icons/frontmatter-short-light.svg'))
    }

    const localhostUrl = await env.asExternalUri(
      Uri.parse(settings.host)
    );

    const cspSource = webView.webview.cspSource;

    webView.webview.onDidReceiveMessage(message => {
      switch (message.command) {
        case PreviewCommands.toVSCode.open:
          if (message.data) {
            commands.executeCommand('vscode.open', message.data);
          }
          return;
      }
    });


    const dashboardFile = "dashboardWebView.js";
    const localPort = `9000`;
    const localServerUrl = `localhost:${localPort}`;

    const nonce = WebviewHelper.getNonce();

    const ext = Extension.getInstance();
    const isProd = ext.isProductionMode;
    const version = ext.getVersion();
    const isBeta = ext.isBetaVersion();
    const extensionUri = ext.extensionPath;
    
    const csp = [
      `default-src 'none';`,
      `img-src ${localhostUrl} ${cspSource} http: https:;`,
      `script-src ${isProd ? `'nonce-${nonce}'` : `http://${localServerUrl} http://0.0.0.0:${localPort}`} 'unsafe-eval'`,
      `style-src ${cspSource} 'self' 'unsafe-inline' http: https:`,
      `connect-src https://o1022172.ingest.sentry.io ${isProd ? `` : `ws://${localServerUrl} ws://0.0.0.0:${localPort} http://${localServerUrl} http://0.0.0.0:${localPort}`}`,
      `frame-src ${localhostUrl} ${cspSource} http: https:;`,
    ];

    let scriptUri = "";
    if (isProd) {
      scriptUri = webView.webview.asWebviewUri(Uri.joinPath(extensionUri, 'dist', dashboardFile)).toString();
    } else {
      scriptUri = `http://${localServerUrl}/${dashboardFile}`; 
    }

    webView.webview.html = `
      <!DOCTYPE html>
      <html lang="en" style="width:100%;height:100%;margin:0;padding:0;">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy" content="${csp.join('; ')}">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">

          <title>Front Matter Preview</title>
        </head>
        <body style="width:100%;height:100%;margin:0;padding:0;overflow:hidden">
          <div id="app" data-type="preview" data-url="${urlJoin(localhostUrl.toString(), slug || '')}" data-isProd="${isProd}" data-environment="${isBeta ? "BETA" : "main"}" data-version="${version.usedVersion}" style="width:100%;height:100%;margin:0;padding:0;"></div>

          <script ${isProd ? `nonce="${nonce}"` : ""} src="${scriptUri}"></script>
        </body>
      </html>
    `;

    Telemetry.send(TelemetryEvent.openPreview);
  }

  /**
   * Retrieve all settings related to the preview command
   */
  public static getSettings(): PreviewSettings {
    const host = Settings.get<string>(SETTING_PREVIEW_HOST);
    const pathname = Settings.get<string>(SETTING_PREVIEW_PATHNAME);

    return {
      host,
      pathname
    };
  }
}
