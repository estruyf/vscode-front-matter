import {
  SETTING_PREVIEW_HOST,
  SETTING_PREVIEW_PATHNAME,
  CONTEXT,
  TelemetryEvent,
  PreviewCommands,
  SETTING_EXPERIMENTAL,
  SETTING_DATE_FORMAT,
  GeneralCommands,
  SETTING_PREVIEW_TRAILING_SLASH
} from './../constants';
import { join, parse } from 'path';
import { commands, env, Uri, ViewColumn, window, WebviewPanel, extensions } from 'vscode';
import {
  ArticleHelper,
  Extension,
  parseWinPath,
  processI18nPlaceholders,
  processTimePlaceholders,
  processFmPlaceholders,
  processPathPlaceholders,
  Settings,
  Telemetry,
  processDateTimePlaceholders
} from '../helpers';
import { ContentFolder, ContentType, PreviewSettings } from '../models';
import { Article } from '.';
import { WebviewHelper } from '@estruyf/vscode';
import { Folders } from './Folders';
import { ParsedFrontMatter } from '../parsers';
import { getLocalizationFile } from '../utils/getLocalizationFile';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';
import { joinUrl } from '../utils';
import { i18n } from './i18n';

export class Preview {
  public static filePath: string | undefined = undefined;
  public static webviews: { [filePath: string]: WebviewPanel } = {};

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

    const browserLiteCommand = await this.getBrowserLiteCommand();

    const editor = window.activeTextEditor;
    const crntFilePath = editor?.document.uri.fsPath;
    this.filePath = crntFilePath;

    if (crntFilePath && this.webviews[crntFilePath] && !browserLiteCommand) {
      this.webviews[crntFilePath].reveal();
      return;
    }

    const article = editor ? ArticleHelper.getFrontMatter(editor) : null;
    const slug = await this.getContentSlug(article, editor?.document.uri.fsPath);
    const localhostUrl = await this.getLocalServerUrl();

    if (browserLiteCommand) {
      const pageUrl = joinUrl(localhostUrl.toString(), slug || '');
      commands.executeCommand(browserLiteCommand, pageUrl);
      return;
    }

    // Create the preview webview
    const webView = window.createWebviewPanel(
      'frontMatterPreview',
      article?.data?.title
        ? l10n.t(LocalizationKey.commandsPreviewPanelTitle, article?.data.title)
        : 'Front Matter Preview',
      {
        viewColumn: ViewColumn.Beside,
        preserveFocus: true
      },
      {
        enableScripts: true
      }
    );

    if (crntFilePath) {
      this.webviews[crntFilePath] = webView;
    }

    webView.iconPath = {
      dark: Uri.file(join(extensionPath, 'assets/icons/frontmatter-short-dark.svg')),
      light: Uri.file(join(extensionPath, 'assets/icons/frontmatter-short-light.svg'))
    };

    const cspSource = webView.webview.cspSource;

    webView.onDidDispose(() => {
      if (crntFilePath && this.webviews[crntFilePath]) {
        delete this.webviews[crntFilePath];
      }
      webView.dispose();
    });

    webView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case PreviewCommands.toVSCode.open:
          if (message.payload) {
            commands.executeCommand('vscode.open', message.payload);
          }
          return;
        case GeneralCommands.toVSCode.getLocalization:
          const { requestId } = message;
          if (!requestId) {
            return;
          }

          const fileContents = await getLocalizationFile();

          webView.webview.postMessage({
            command: GeneralCommands.toVSCode.getLocalization,
            requestId,
            payload: fileContents
          });
          return;
      }
    });

    const dashboardFile = 'dashboardWebView.js';
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
      `script-src ${
        isProd ? `'nonce-${nonce}'` : `http://${localServerUrl} http://0.0.0.0:${localPort}`
      } 'unsafe-eval'`,
      `style-src ${cspSource} 'self' 'unsafe-inline' http: https:`,
      `connect-src https://o1022172.ingest.sentry.io ${
        isProd
          ? ``
          : `ws://${localServerUrl} ws://0.0.0.0:${localPort} http://${localServerUrl} http://0.0.0.0:${localPort}`
      }`,
      `frame-src ${localhostUrl} ${cspSource} http: https:;`
    ];

    let scriptUri = '';
    if (isProd) {
      scriptUri = webView.webview
        .asWebviewUri(Uri.joinPath(extensionUri, 'dist', dashboardFile))
        .toString();
    } else {
      scriptUri = `http://${localServerUrl}/${dashboardFile}`;
    }

    // Get experimental setting
    const experimental = Settings.get(SETTING_EXPERIMENTAL);

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
          <div id="app" data-type="preview" data-url="${joinUrl(
            localhostUrl.toString(),
            slug || ''
          )}" data-isProd="${isProd}" data-environment="${
      isBeta ? 'BETA' : 'main'
    }" data-version="${version.usedVersion}" ${
      experimental ? `data-experimental="${experimental}"` : ''
    } style="width:100%;height:100%;margin:0;padding:0;"></div>

          <script ${isProd ? `nonce="${nonce}"` : ''} src="${scriptUri}"></script>
        </body>
      </html>
    `;

    Telemetry.send(TelemetryEvent.openPreview);
  }

  /**
   * Update the url of the preview webview
   * @param filePath
   * @param slug
   */
  public static async updatePageUrl(filePath: string, _: string) {
    const webView = this.webviews[filePath];
    if (webView) {
      const localhost = await this.getLocalServerUrl();
      const article = await ArticleHelper.getFrontMatterByPath(filePath);
      const slug = await this.getContentSlug(article, filePath);

      webView.webview.postMessage({
        command: PreviewCommands.toWebview.updateUrl,
        payload: joinUrl(localhost.toString(), slug || '')
      });
    }
  }

  /**
   * Retrieve the slug of the content
   * @param article
   * @param filePath
   * @returns
   */
  public static async getContentSlug(
    article: ParsedFrontMatter | null | undefined,
    filePath?: string
  ): Promise<string | undefined> {
    if (!filePath) {
      return;
    }

    let slug = article?.data ? article.data.slug : '';

    const settings = this.getSettings();
    let pathname = settings.pathname;

    let selectedFolder: ContentFolder | undefined | null = null;
    filePath = parseWinPath(filePath);

    let contentType: ContentType | undefined = undefined;
    if (article?.data) {
      contentType = await ArticleHelper.getContentType(article);
    }

    // Check if there is a pathname defined on content folder level
    const folders = await Folders.get();
    if (folders.length > 0) {
      const foldersWithPath = folders.filter((folder) => folder.previewPath);

      for (const folder of foldersWithPath) {
        const folderPath = parseWinPath(folder.path);
        if (filePath.startsWith(folderPath)) {
          if (!selectedFolder || selectedFolder.path.length < folderPath.length) {
            selectedFolder = folder;
          }
        }
      }

      if (!selectedFolder && article?.data && contentType && !contentType.previewPath) {
        // Try to find the folder by content type
        let crntFolders = folders.filter(
          (folder) =>
            folder.contentTypes?.includes((contentType as ContentType).name) && folder.previewPath
        );

        // Use file path to find the folder
        if (crntFolders.length > 0) {
          crntFolders = crntFolders.filter((folder) => filePath?.startsWith(folder.path));
        }

        if (crntFolders && crntFolders.length === 1) {
          selectedFolder = crntFolders[0];
        } else if (crntFolders && crntFolders.length > 1) {
          selectedFolder = await Preview.askUserToPickFolder(crntFolders);
        } else {
          selectedFolder = await Preview.askUserToPickFolder(folders.filter((f) => f.previewPath));
        }
      }

      if (selectedFolder && selectedFolder.previewPath) {
        pathname = selectedFolder.previewPath;
      }
    }

    // Check if there is a pathname defined on content type level
    if (article?.data) {
      if (contentType && contentType.previewPath) {
        pathname = contentType.previewPath;
      }
    }

    if (!slug) {
      slug = Article.getSlug();
    }

    const locale = await i18n.getLocale(filePath);
    if (locale && locale.path === slug) {
      slug = '';
    }

    if (pathname) {
      // Known placeholders
      const dateFormat = Settings.get(SETTING_DATE_FORMAT) as string;
      pathname = processTimePlaceholders(pathname, dateFormat);

      // Custom placeholders
      pathname = await ArticleHelper.processCustomPlaceholders(
        pathname,
        article?.data?.title,
        filePath
      );

      // Process the path placeholders - {{pathToken.<integer>}}
      if (filePath) {
        const wsFolder = Folders.getWorkspaceFolder();
        // Get relative file path
        const folderPath = wsFolder ? parseWinPath(wsFolder.fsPath) : '';
        const relativePath = filePath.replace(folderPath, '');
        pathname = processPathPlaceholders(pathname, relativePath, filePath, selectedFolder);
        pathname = processI18nPlaceholders(pathname, selectedFolder);

        const file = parse(filePath);
        if (file.name.toLowerCase() === 'index') {
          const cleanPathName = pathname.endsWith('/')
            ? pathname.substring(0, pathname.length - 1)
            : pathname;

          if (cleanPathName.endsWith(slug) || !pathname || pathname === '/') {
            slug = '';
          }
        }
      }

      // Support front matter placeholders - {{fm.<field>}}
      pathname = article?.data ? processFmPlaceholders(pathname, article?.data) : pathname;

      try {
        const articleDate = await ArticleHelper.getDate(article);
        pathname = processDateTimePlaceholders(pathname, dateFormat, articleDate);
        slug = join(pathname, slug);
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

    // Add the trailing slash
    let trailingSlash = false;
    if (settings.trailingSlash !== undefined) {
      trailingSlash = settings.trailingSlash;
    }

    if (selectedFolder && selectedFolder.trailingSlash !== undefined) {
      trailingSlash = selectedFolder.trailingSlash;
    }

    if (contentType && contentType.trailingSlash !== undefined) {
      trailingSlash = contentType.trailingSlash;
    }

    if (trailingSlash && !slug.endsWith('/')) {
      slug = `${slug}/`;
    }

    return slug;
  }

  /**
   * Check if Browser Lite is installed
   */
  private static async getBrowserLiteCommand() {
    const ext = extensions.getExtension(`antfu.browse-lite`);
    if (ext && ext.packageJSON) {
      const hasCommand = ext.packageJSON.contributes?.commands?.find(
        (c: { command: string }) => c.command === 'browse-lite.open'
      );
      if (hasCommand) {
        return 'browse-lite.open';
      }
    }
    return undefined;
  }

  /**
   * Retrieve the localhost url
   * @returns
   */
  private static async getLocalServerUrl() {
    const settings = Preview.getSettings();
    const crntUrl = settings?.host?.startsWith('http') ? settings.host : `http://${settings.host}`;
    const localhostUrl = await env.asExternalUri(Uri.parse(crntUrl));
    return localhostUrl;
  }

  /**
   * Retrieve all settings related to the preview command
   */
  public static getSettings(): PreviewSettings {
    const host = Settings.get<string>(SETTING_PREVIEW_HOST);
    const pathname = Settings.get<string>(SETTING_PREVIEW_PATHNAME);
    const trailingSlash = Settings.get<boolean>(SETTING_PREVIEW_TRAILING_SLASH);

    return {
      host,
      pathname,
      trailingSlash
    };
  }

  /**
   * Ask the user to select the folder of the article to preview
   * @param crntFolders
   * @returns
   */
  private static async askUserToPickFolder(
    crntFolders: ContentFolder[]
  ): Promise<ContentFolder | undefined> {
    let selectedFolder: ContentFolder | undefined = undefined;

    if (crntFolders.length === 0) {
      return undefined;
    }

    // Ask the user to select the folder
    const folderNames = crntFolders.map((folder) => folder.title);
    const selectedFolderName = await window.showQuickPick(folderNames, {
      canPickMany: false,
      title: l10n.t(LocalizationKey.commandsPreviewAskUserToPickFolderTitle)
    });

    if (selectedFolderName) {
      selectedFolder = crntFolders.find((folder) => folder.title === selectedFolderName);
    }

    return selectedFolder;
  }
}
