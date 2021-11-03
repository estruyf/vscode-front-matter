import { SETTING_PREVIEW_HOST, SETTING_PREVIEW_PATHNAME, CONTEXT } from './../constants';
import { ArticleHelper } from './../helpers/ArticleHelper';
import { join } from "path";
import { commands, env, Uri, ViewColumn, window } from "vscode";
import { Settings } from '../helpers';
import { PreviewSettings } from '../models';
import { format } from 'date-fns';
import { DateHelper } from '../helpers/DateHelper';
import { Article } from '.';
import { urlJoin } from 'url-join-ts';


export class Preview {

  /** 
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
      dark: Uri.file(join(extensionPath, 'assets/frontmatter-dark.svg')),
      light: Uri.file(join(extensionPath, 'assets/frontmatter.svg'))
    }

    const localhostUrl = await env.asExternalUri(
      Uri.parse(settings.host)
    );

    const cspSource = webView.webview.cspSource;

    webView.webview.html = `<!DOCTYPE html>
  <head>
    <meta
        http-equiv="Content-Security-Policy"
        content="default-src 'none'; frame-src ${localhostUrl} ${cspSource} http: https:; img-src ${localhostUrl} ${cspSource} http: https:; script-src ${localhostUrl} ${cspSource} 'unsafe-inline'; style-src ${localhostUrl} ${cspSource} 'self' 'unsafe-inline' http: https:;"
    />
    <style>
      html,body { 
        margin: 0;
        padding: 0;
        background: white;
        height: 100%;
        width: 100%;
      }
      
      body {
        margin: 0;
        padding: 0;
      }

      iframe {
        width: 100%;
        height: calc(100% - 30px);
        border: 0;
        margin-top: 30px;
      }

      .slug {
        width: 100%;
        position: fixed;
        height: 30px;
        display: flex;
        align-items: center;
        background-color: var(--vscode-editor-background);
        border-bottom: 1px solid var(--vscode-focusBorder);
      }

      input {
        color: var(--vscode-editor-foreground);
        padding: 0.25rem 0.5rem;
        background: none;
        border: 0;
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div class="slug">
      <input type="text" value="${urlJoin(localhostUrl.toString(), slug || '')}" disabled />
    </div>
    <iframe src="${urlJoin(localhostUrl.toString(), slug || '')}" >
  </body>
</html>`;
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
