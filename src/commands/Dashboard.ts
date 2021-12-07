import { SETTINGS_CONTENT_STATIC_FOLDER, SETTING_DATE_FIELD, SETTING_SEO_DESCRIPTION_FIELD, SETTINGS_DASHBOARD_OPENONSTART, SETTINGS_DASHBOARD_MEDIA_SNIPPET, SETTING_TAXONOMY_CONTENT_TYPES, DefaultFields, HOME_PAGE_NAVIGATION_ID, ExtensionState, COMMAND_NAME, SETTINGS_FRAMEWORK_ID, SETTINGS_CONTENT_DRAFT_FIELD, SETTINGS_CONTENT_SORTING, CONTEXT, SETTING_CUSTOM_SCRIPTS, SETTINGS_CONTENT_SORTING_DEFAULT, SETTINGS_MEDIA_SORTING_DEFAULT } from '../constants';
import { ArticleHelper } from './../helpers/ArticleHelper';
import { basename, dirname, extname, join, parse } from "path";
import { existsSync, readdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import { commands, Uri, ViewColumn, Webview, WebviewPanel, window, workspace, env, Position } from "vscode";
import { Settings as SettingsHelper } from '../helpers';
import { CustomScript as ICustomScript, DraftField, Framework, ScriptType, SortingSetting, SortOrder, SortType, TaxonomyType } from '../models';
import { Folders } from './Folders';
import { DashboardCommand } from '../dashboardWebView/DashboardCommand';
import { DashboardMessage } from '../dashboardWebView/DashboardMessage';
import { Page } from '../dashboardWebView/models/Page';
import { openFileInEditor } from '../helpers/openFileInEditor';
import { Template } from './Template';
import { Notifications } from '../helpers/Notifications';
import { Settings } from '../dashboardWebView/models/Settings';
import { Extension } from '../helpers/Extension';
import { ViewType } from '../dashboardWebView/state';
import { EditorHelper, WebviewHelper } from '@estruyf/vscode';
import { MediaInfo, MediaPaths } from './../models/MediaPaths';
import { decodeBase64Image } from '../helpers/decodeBase64Image';
import { DashboardData } from '../models/DashboardData';
import { ExplorerView } from '../explorerView/ExplorerView';
import { MediaLibrary } from '../helpers/MediaLibrary';
import { parseWinPath } from '../helpers/parseWinPath';
import { DateHelper } from '../helpers/DateHelper';
import { FrameworkDetector } from '../helpers/FrameworkDetector';
import { ContentType } from '../helpers/ContentType';
import { SortingOption } from '../dashboardWebView/models';
import { Sorting } from '../helpers/Sorting';
import imageSize from 'image-size';
import { CustomScript } from '../helpers/CustomScript';

export class Dashboard {
  private static webview: WebviewPanel | null = null;
  private static isDisposed: boolean = true;
  private static media: MediaInfo[] = [];
  private static timers: { [folder: string]: any } = {};
  private static _viewData: DashboardData | undefined;
  private static mediaLib: MediaLibrary;

  public static get viewData(): DashboardData | undefined {
    return Dashboard._viewData;
  }

  /**
   * Init the dashboard
   */
  public static async init() {
    const openOnStartup = SettingsHelper.get(SETTINGS_DASHBOARD_OPENONSTART);
    if (openOnStartup) {
      Dashboard.open();
    }
  }

  /**
   * Open or reveal the dashboard
   */
  public static async open(data?: DashboardData) {
    this.mediaLib = MediaLibrary.getInstance();
    
    Dashboard._viewData = data;

    if (Dashboard.isOpen) {
			Dashboard.reveal();
		} else {
			Dashboard.create();
		}

    await commands.executeCommand('setContext', CONTEXT.isDashboardOpen, true);
  }

  /**
   * Check if the dashboard is still open
   */
  public static get isOpen(): boolean {
    return !Dashboard.isDisposed;
  }

  /**
   * Reveal the dashboard if it is open
   */
  public static reveal() {
    if (Dashboard.webview) {
      Dashboard.webview.reveal();
    }
  }

  public static close() {
    Dashboard.webview?.dispose();
  }
  
  /**
   * Create the dashboard webview
   */
  public static async create() {
    const extensionUri = Extension.getInstance().extensionPath;

    // Create the preview webview
    Dashboard.webview = window.createWebviewPanel(
      'frontMatterDashboard',
      'FrontMatter Dashboard',
      ViewColumn.One,
      {
        enableScripts: true
      }
    );

    Dashboard.isDisposed = false;

    Dashboard.webview.iconPath = {
      dark: Uri.file(join(extensionUri.fsPath, 'assets/icons/frontmatter-short-dark.svg')),
      light: Uri.file(join(extensionUri.fsPath, 'assets/icons/frontmatter-short-light.svg'))
    };

    Dashboard.webview.webview.html = Dashboard.getWebviewContent(Dashboard.webview.webview, extensionUri);

    Dashboard.webview.onDidChangeViewState(async () => {
      if (!this.webview?.visible) {
        Dashboard._viewData = undefined;
        const panel = ExplorerView.getInstance(extensionUri);
        panel.getMediaSelection();
      }

      await commands.executeCommand('setContext', CONTEXT.isDashboardOpen, this.webview?.visible);
    });

    Dashboard.webview.onDidDispose(async () => {
      Dashboard.isDisposed = true;
      Dashboard._viewData = undefined;
      const panel = ExplorerView.getInstance(extensionUri);
      panel.getMediaSelection();
      await commands.executeCommand('setContext', CONTEXT.isDashboardOpen, false);
    });

    SettingsHelper.onConfigChange((global?: any) => {
      Dashboard.getSettings();
    });

    Dashboard.webview.webview.onDidReceiveMessage(async (msg) => {
      switch(msg.command) {
        case DashboardMessage.getViewType:
          if (Dashboard._viewData) {
            Dashboard.postWebviewMessage({ command: DashboardCommand.viewData, data: Dashboard._viewData });
          }
          break;
        case DashboardMessage.getData:
          Dashboard.getSettings();
          Dashboard.getPages();
          break;
        case DashboardMessage.openFile:
          openFileInEditor(msg.data);
          break;
        case DashboardMessage.createContent:
          await commands.executeCommand(COMMAND_NAME.createContent);
          break;
        case DashboardMessage.createByContentType:
          await commands.executeCommand(COMMAND_NAME.createByContentType);
          break;
        case DashboardMessage.createByTemplate:
          await commands.executeCommand(COMMAND_NAME.createByTemplate);
          break;
        case DashboardMessage.updateSetting:
          Dashboard.updateSetting(msg.data);
          break;
        case DashboardMessage.initializeProject:
          await commands.executeCommand(COMMAND_NAME.init, Dashboard.getSettings);
          break;
        case DashboardMessage.reload:
          if (!Dashboard.isDisposed) {
            Dashboard.webview?.dispose();
            setTimeout(() => {
              Dashboard.open();
            }, 100);
          }
          break;
        case DashboardMessage.setPageViewType:
          Extension.getInstance().setState(ExtensionState.PagesView, msg.data, "workspace");
          break;
        case DashboardMessage.getMedia:
          Dashboard.getMedia(msg?.data?.page, msg?.data?.folder, msg?.data?.sorting);
          break;
        case DashboardMessage.copyToClipboard:
          env.clipboard.writeText(msg.data);
          break;
        case DashboardMessage.refreshMedia:
          Dashboard.resetMedia();
          Dashboard.getMedia(0, msg?.data?.folder);
          break;
        case DashboardMessage.uploadMedia:
          Dashboard.saveFile(msg?.data);
          break;
        case DashboardMessage.deleteMedia:
          Dashboard.deleteFile(msg?.data);
          break;
        case DashboardMessage.insertPreviewImage:
          Dashboard.insertImage(msg?.data);
          break;
        case DashboardMessage.updateMediaMetadata:
          Dashboard.updateMediaMetadata(msg?.data);
          break;
        case DashboardMessage.createMediaFolder:
          await commands.executeCommand(COMMAND_NAME.createFolder, msg?.data);
          break;
        case DashboardMessage.setFramework:
          Dashboard.setFramework(msg?.data);
          break;
        case DashboardMessage.runCustomScript:
          CustomScript.run(msg?.data?.script, msg?.data?.path);
          break;
        case DashboardMessage.setState:
          if (msg?.data?.key && msg?.data?.value) {
            Extension.getInstance().setState(msg?.data?.key, msg?.data?.value, "workspace");
          }
          break;
      }
    });
  }

  /**
   * Reset media array
   */
  public static resetMedia() {
    Dashboard.media = [];
  }

  public static switchFolder(folderPath: string) {
    Dashboard.resetMedia();
    Dashboard.getMedia(0, folderPath);
  }

  /**
   * Post data to the dashboard
   * @param msg 
   */
  public static postWebviewMessage(msg: { command: DashboardCommand, data?: any }) {
    if (Dashboard.isDisposed) {
      return;
    }

    if (Dashboard.webview) {
      Dashboard.webview?.webview.postMessage(msg);
    }
  }
  
  /**
   * Insert an image into the front matter or contents
   * @param data 
   */
  private static async insertImage(data: any) {
    if (data?.file && data?.image) {
      if (!data?.position) {
        await commands.executeCommand(`workbench.view.extension.frontmatter-explorer`);
      }

      await EditorHelper.showFile(data.file);
      Dashboard._viewData = undefined;
      
      const extensionUri = Extension.getInstance().extensionPath;
      const panel = ExplorerView.getInstance(extensionUri);

      if (data?.position) {
        const wsFolder = Folders.getWorkspaceFolder();
        const editor = window.activeTextEditor;
        const line = data.position.line;
        const character = data.position.character;
        if (line) {
          let imgPath = data.image;
          const filePath = data.file;
          const absImgPath = join(parseWinPath(wsFolder?.fsPath || ""), imgPath);

          const imgDir = dirname(absImgPath);
          const fileDir = dirname(filePath);

          if (imgDir === fileDir) {
            imgPath = join('/', basename(imgPath));

            // Snippets are already parsed, so update the URL of the image
            if (data.snippet) {
              data.snippet = data.snippet.replace(data.image, imgPath);
            }
          }

          await editor?.edit(builder => builder.insert(new Position(line, character), data.snippet || `![${data.alt || data.caption || ""}](${imgPath})`));
        }
        panel.getMediaSelection();
      } else {
        panel.getMediaSelection();
        panel.updateMetadata({field: data.fieldName, value: data.image });
      }
    }
  }

  /**
   * Retrieve the settings for the dashboard
   */
  private static async getSettings() { 
    const ext = Extension.getInstance();
    const wsFolder = Folders.getWorkspaceFolder();
    const isInitialized = await Template.isInitialized();
    
    Dashboard.postWebviewMessage({
      command: DashboardCommand.settings,
      data: {
        beta: ext.isBetaVersion(),
        wsFolder: wsFolder ? wsFolder.fsPath : '',
        staticFolder: SettingsHelper.get<string>(SETTINGS_CONTENT_STATIC_FOLDER),
        folders: Folders.get(),
        initialized: isInitialized,
        tags: SettingsHelper.getTaxonomy(TaxonomyType.Tag),
        categories: SettingsHelper.getTaxonomy(TaxonomyType.Category),
        openOnStart: SettingsHelper.get(SETTINGS_DASHBOARD_OPENONSTART),
        versionInfo: ext.getVersion(),
        pageViewType: await ext.getState<ViewType | undefined>(ExtensionState.PagesView, "workspace"),
        mediaSnippet: SettingsHelper.get<string[]>(SETTINGS_DASHBOARD_MEDIA_SNIPPET) || [],
        contentTypes: SettingsHelper.get(SETTING_TAXONOMY_CONTENT_TYPES) || [],
        draftField: SettingsHelper.get<DraftField>(SETTINGS_CONTENT_DRAFT_FIELD),
        customSorting: SettingsHelper.get<SortingSetting[]>(SETTINGS_CONTENT_SORTING),
        contentFolders: Folders.get(),
        crntFramework: SettingsHelper.get<string>(SETTINGS_FRAMEWORK_ID),
        framework: (!isInitialized && wsFolder) ? FrameworkDetector.get(wsFolder.fsPath) : null,
        scripts: (SettingsHelper.get<ICustomScript[]>(SETTING_CUSTOM_SCRIPTS) || []).filter(s => s.type && s.type !== ScriptType.Content),
        dashboardState: {
          contents: {
            sorting: await ext.getState<SortingOption | undefined>(ExtensionState.Dashboard.Contents.Sorting, "workspace"),
            defaultSorting: SettingsHelper.get<string>(SETTINGS_CONTENT_SORTING_DEFAULT)
          },
          media: {
            sorting: await ext.getState<SortingOption | undefined>(ExtensionState.Dashboard.Media.Sorting, "workspace"),
            defaultSorting: SettingsHelper.get<string>(SETTINGS_MEDIA_SORTING_DEFAULT)
          }
        }
      } as Settings
    });
  }

  /**
   * Set the current site-generator or framework + related settings
   * @param frameworkId 
   */
  private static setFramework(frameworkId: string | null) {
    SettingsHelper.update(SETTINGS_FRAMEWORK_ID, frameworkId, true);

    if (frameworkId) {
      const allFrameworks = FrameworkDetector.getAll();
      const framework = allFrameworks.find((f: Framework) => f.name === frameworkId);
      if (framework) {
        SettingsHelper.update(SETTINGS_CONTENT_STATIC_FOLDER, framework.static, true);
      } else {
        SettingsHelper.update(SETTINGS_CONTENT_STATIC_FOLDER, "", true);
      }
    }
  }

  /**
   * Update a setting from the dashboard
   */
  private static async updateSetting(data: { name: string, value: any }) {
    await SettingsHelper.update(data.name, data.value);
    Dashboard.getSettings();
  }

  /**
   * Retrieve all media files
   */
  private static async getMedia(page: number = 0, requestedFolder: string = '', sort: SortingOption | null = null) {
    const wsFolder = Folders.getWorkspaceFolder();
    const staticFolder = SettingsHelper.get<string>(SETTINGS_CONTENT_STATIC_FOLDER);
    const contentFolders = Folders.get();
    const viewData = Dashboard.viewData;
    let selectedFolder = requestedFolder;

    const ext = Extension.getInstance();
    const crntSort = sort === null ? await ext.getState<SortingOption | undefined>(ExtensionState.Dashboard.Media.Sorting, "workspace") : sort;

    // If the static folder is not set, retreive the last opened location
    if (!selectedFolder) {
      const stateValue = await ext.getState<string | undefined>(ExtensionState.SelectedFolder, "workspace");

      if (stateValue !== HOME_PAGE_NAVIGATION_ID) {
        // Support for page bundles
        if (viewData?.data?.filePath && viewData?.data?.filePath.endsWith('index.md')) {
          const folderPath = parse(viewData.data.filePath).dir;
          selectedFolder = folderPath;
        } else if (stateValue && existsSync(stateValue)) {
          selectedFolder = stateValue;
        }
      }
    }

    // Go to the home folder
    if (selectedFolder === HOME_PAGE_NAVIGATION_ID) {
      selectedFolder = '';
    }

    let relSelectedFolderPath = selectedFolder;
    const parsedPath = parseWinPath(wsFolder?.fsPath || "");
    if (selectedFolder && selectedFolder.startsWith(parsedPath)) {
      relSelectedFolderPath = selectedFolder.replace(parsedPath, '');
    }

    if (relSelectedFolderPath.startsWith('/')) {
      relSelectedFolderPath = relSelectedFolderPath.substring(1);
    }

    let allMedia: MediaInfo[] = [];

    if (relSelectedFolderPath) {
      const files = await workspace.findFiles(join(relSelectedFolderPath, '/*'));
      const media = await Dashboard.updateMediaData(Dashboard.filterMedia(files));

      allMedia = [...media];
    } else {
      if (staticFolder) {
        const folderSearch = join(staticFolder || "", '/*');
        const files = await workspace.findFiles(folderSearch);
        const media = await Dashboard.updateMediaData(Dashboard.filterMedia(files));

        allMedia = [...media];
      }

      if (contentFolders && wsFolder) {
        for (let i = 0; i < contentFolders.length; i++) {
          const contentFolder = contentFolders[i];
          const relFolderPath = contentFolder.path.substring(wsFolder.fsPath.length + 1);
          const folderSearch = relSelectedFolderPath ? join(relSelectedFolderPath, '/*') : join(relFolderPath, '/*');
          const files = await workspace.findFiles(folderSearch);
          const media = await Dashboard.updateMediaData(Dashboard.filterMedia(files));
    
          allMedia = [...allMedia, ...media];
        }
      }
    }

    if (crntSort?.type === SortType.string) {
      allMedia = allMedia.sort(Sorting.alphabetically("fsPath"));
    } else if (crntSort?.type === SortType.date) {
      allMedia = allMedia.sort(Sorting.dateWithFallback("mtime", "fsPath"));
    } else {
      allMedia = allMedia.sort(Sorting.alphabetically("fsPath"));
    }

    if (crntSort?.order === SortOrder.desc) {
      allMedia = allMedia.reverse();
    }

    Dashboard.media = Object.assign([], allMedia);

    let files: MediaInfo[] = Dashboard.media;

    // Retrieve the total after filtering and before the slicing happens
    const total = files.length;

    // Get media set
    files = files.slice(page * 16, ((page + 1) * 16));
    files = files.map((file) => {
      try {
        const metadata = Dashboard.mediaLib.get(file.fsPath);

        return {
          ...file,
          dimensions: imageSize(file.fsPath),
          ...metadata
        };
      } catch (e) {
        return {...file};
      }
    });
    files = files.filter(f => f.mtime !== undefined);

    // Retrieve all the folders
    let allContentFolders: string[] = [];
    let allFolders: string[] = [];

    if (selectedFolder) {
      if (existsSync(selectedFolder)) {
        allFolders = readdirSync(selectedFolder, { withFileTypes: true }).filter(dir => dir.isDirectory()).map(dir => parseWinPath(join(selectedFolder, dir.name)));
      }
    } else {
      for (const contentFolder of contentFolders) {
        const contentPath = contentFolder.path;
        if (contentPath && existsSync(contentPath)) {
          const subFolders = readdirSync(contentPath, { withFileTypes: true }).filter(dir => dir.isDirectory()).map(dir => parseWinPath(join(contentPath, dir.name)));
          allContentFolders = [...allContentFolders, ...subFolders];
        }
      }
  
      const staticPath = join(parseWinPath(wsFolder?.fsPath || ""), staticFolder || "");
      if (staticPath && existsSync(staticPath)) {
        allFolders = readdirSync(staticPath, { withFileTypes: true }).filter(dir => dir.isDirectory()).map(dir => parseWinPath(join(staticPath, dir.name)));
      }
    }

    // Store the last opened folder
    await Extension.getInstance().setState(ExtensionState.SelectedFolder, requestedFolder === HOME_PAGE_NAVIGATION_ID ? HOME_PAGE_NAVIGATION_ID : selectedFolder, "workspace");
    
    let sortedFolders = [...allContentFolders, ...allFolders];
    sortedFolders = sortedFolders.sort((a, b) => {
      if (a.toLowerCase() < b.toLowerCase()) {
        return -1;
      }
      if (a.toLowerCase() > b.toLowerCase()) {
        return 1;
      }
      return 0;
    });

    if (crntSort?.order === SortOrder.desc) {
      sortedFolders = sortedFolders.reverse();
    }

    Dashboard.postWebviewMessage({
      command: DashboardCommand.media,
      data: {
        media: files,
        total: total,
        folders: sortedFolders,
        selectedFolder
      } as MediaPaths
    });
  }

  /**
   * Update the metadata of the retrieved files
   * @param files 
   */
  private static async updateMediaData(files: MediaInfo[]) {
    files = files.map((m: MediaInfo) => {
      const stats = statSync(m.fsPath);
      return Object.assign({}, m, stats);
    });

    return Object.assign([], files);
  }

  /**
   * Retrieve all the markdown pages
   */
  private static async getPages() {
    const wsFolder = Folders.getWorkspaceFolder();

    const descriptionField = SettingsHelper.get(SETTING_SEO_DESCRIPTION_FIELD) as string || DefaultFields.Description;
    const dateField = SettingsHelper.get(SETTING_DATE_FIELD) as string || DefaultFields.PublishingDate;
    const staticFolder = SettingsHelper.get<string>(SETTINGS_CONTENT_STATIC_FOLDER);

    const folderInfo = await Folders.getInfo();
    const pages: Page[] = [];

    if (folderInfo) {
      for (const folder of folderInfo) {
        for (const file of folder.lastModified) {
          if (file.fileName.endsWith(`.md`) || file.fileName.endsWith(`.markdown`) || file.fileName.endsWith(`.mdx`)) {
            try {
              const article = ArticleHelper.getFrontMatterByPath(file.filePath);

              if (article?.data.title) {
                const page: Page = {
                  ...article.data,
                  // FrontMatter properties
                  fmFolder: folder.title,
                  fmModified: file.mtime,
                  fmFilePath: file.filePath,
                  fmFileName: file.fileName,
                  fmDraft: ContentType.getDraftStatus(article?.data),
                  fmYear: article?.data[dateField] ? DateHelper.tryParse(article?.data[dateField])?.getFullYear() : null,
                  // Make sure these are always set
                  title: article?.data.title,
                  slug: article?.data.slug,
                  date: article?.data[dateField] || "",
                  draft: article?.data.draft,
                  description: article?.data[descriptionField] || "",
                };

                const contentType = ArticleHelper.getContentType(article.data);
                const previewField = contentType.fields.find(field => field.isPreviewImage && field.type === "image")?.name || "preview";

                if (article?.data[previewField] && wsFolder) {
                  let fieldValue = article?.data[previewField];
                  if (fieldValue && Array.isArray(fieldValue)) {
                    if (fieldValue.length > 0) {
                      fieldValue = fieldValue[0];
                    } else {
                      fieldValue = undefined;
                    }
                  }

                  // Revalidate as the array could have been empty
                  if (fieldValue) {
                    const staticPath = join(wsFolder.fsPath, staticFolder || "", fieldValue);
                    const contentFolderPath = join(dirname(file.filePath), fieldValue);

                    let previewUri = null;
                    if (existsSync(staticPath)) {
                      previewUri = Uri.file(staticPath);
                    } else if (existsSync(contentFolderPath)) {
                      previewUri = Uri.file(contentFolderPath);
                    }

                    if (previewUri) {
                      const preview = Dashboard.webview?.webview.asWebviewUri(previewUri);
                      page[previewField] = preview?.toString() || "";
                    } else {
                      page[previewField] = "";
                    }
                  }
                }
      
                pages.push(page);
              }
            } catch (error: any) {
              Notifications.error(`File error: ${file.filePath} - ${error?.message || error}`);
            }
          }
        }
      }
    }

    Dashboard.postWebviewMessage({
      command: DashboardCommand.pages,
      data: pages
    });
  }

  /**
   * Filter the media files
   */
  private static filterMedia(files: Uri[]) {
    return files.filter(file => {
      const ext = extname(file.fsPath);
      return ['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext);
    }).map((file) => ({
      fsPath: file.fsPath,
      vsPath: Dashboard.webview?.webview.asWebviewUri(file).toString(),
      stats: undefined
    } as MediaInfo));
  }

  /**
   * Save the dropped file in the current folder
   * @param fileData 
   */
  private static async saveFile({fileName, contents, folder}: { fileName: string; contents: string; folder: string | null }) {
    if (fileName && contents) {
      const wsFolder = Folders.getWorkspaceFolder();
      const staticFolder = SettingsHelper.get<string>(SETTINGS_CONTENT_STATIC_FOLDER);
      const wsPath = wsFolder ? wsFolder.fsPath : "";
      let absFolderPath = join(wsPath, staticFolder || "");

      if (folder) {
        absFolderPath = folder;
      }

      if (!existsSync(absFolderPath)) {
        absFolderPath = join(wsPath, folder || "");
      }

      if (!existsSync(absFolderPath)) {
        Notifications.error(`We couldn't find your selected folder.`);
        return;
      }

      const staticPath = join(absFolderPath, fileName);
      const imgData = decodeBase64Image(contents);

      if (imgData) {
        writeFileSync(staticPath, imgData.data);
        Notifications.info(`File ${fileName} uploaded to: ${folder}`);
        
        const folderPath = `${folder}`;
        if (Dashboard.timers[folderPath]) {
          clearTimeout(Dashboard.timers[folderPath]);
          delete Dashboard.timers[folderPath];
        }
        
        Dashboard.timers[folderPath] = setTimeout(() => {
          Dashboard.media = [];
          Dashboard.getMedia(0, folder || "");
          delete Dashboard.timers[folderPath];
        }, 500);
      } else {
        Notifications.error(`Something went wrong uploading ${fileName}`);
      }
    }
  }

  /**
   * Delete the selected file
   * @param fileData 
   */
  private static async deleteFile({ file, page, folder }: { file: string; page: number; folder: string | null; }) {
    if (!file) {
      return;
    }

    try {
      unlinkSync(file);

      Dashboard.media = [];
      Dashboard.getMedia(page || 0, folder || "");
    } catch(err) {
      Notifications.error(`Something went wrong deleting ${basename(file)}`);
    }
  }

  /**
   * Update the metadata of the selected file
   */
  private static async updateMediaMetadata({ file, filename, page, folder, ...metadata }: { file:string; filename:string; page: number; folder: string | null; metadata: any; }) {
    Dashboard.mediaLib.set(file, metadata);

    // Check if filename needs to be updated
    Dashboard.mediaLib.updateFilename(file, filename);

    Dashboard.getMedia(page || 0, folder || "");
  }
  
  /**
   * Retrieve the webview HTML contents
   * @param webView 
   */
  private static getWebviewContent(webView: Webview, extensionPath: Uri): string {
    const scriptUri = webView.asWebviewUri(Uri.joinPath(extensionPath, 'dist', 'pages.js'));

    const nonce = WebviewHelper.getNonce();

    const ext = Extension.getInstance();
    const version = ext.getVersion();
    const isBeta = ext.isBetaVersion();

    return `
      <!DOCTYPE html>
      <html lang="en" style="width:100%;height:100%;margin:0;padding:0;">
      <head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${`vscode-file://vscode-app`} ${webView.cspSource} https://api.visitorbadge.io 'self' 'unsafe-inline'; script-src 'nonce-${nonce}'; style-src ${webView.cspSource} 'self' 'unsafe-inline'; font-src ${webView.cspSource}; connect-src https://o1022172.ingest.sentry.io">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>Front Matter Dashboard</title>
      </head>
      <body style="width:100%;height:100%;margin:0;padding:0;overflow:hidden" class="bg-gray-100 text-vulcan-500 dark:bg-vulcan-500 dark:text-whisper-500">
        <div id="app" data-environment="${isBeta ? "BETA" : "main"}" data-version="${version.usedVersion}" style="width:100%;height:100%;margin:0;padding:0;" ${version.usedVersion ? "" : `data-showWelcome="true"`}></div>

        <img style="display:none" src="https://api.visitorbadge.io/api/combined?user=estruyf&repo=frontmatter-usage&countColor=%23263759&slug=${`dashboard-${version.installedVersion}`}" alt="Daily usage" />

        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}