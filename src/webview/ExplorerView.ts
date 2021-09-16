import { DashboardData } from './../models/DashboardData';
import { Template } from './../commands/Template';
import { SETTINGS_CONTENT_FRONTMATTER_HIGHLIGHT, SETTING_AUTO_UPDATE_DATE, SETTING_CUSTOM_SCRIPTS, SETTING_SEO_CONTENT_MIN_LENGTH, SETTING_SEO_DESCRIPTION_FIELD, SETTING_SLUG_UPDATE_FILE_NAME, SETTING_PREVIEW_HOST, SETTING_DATE_FORMAT, SETTING_DATE_FIELD, SETTING_MODIFIED_FIELD, SETTING_COMMA_SEPARATED_FIELDS, SETTINGS_CONTENT_STATIC_FOLDERS, SETTING_TAXONOMY_CONTENT_TYPES } from './../constants/settings';
import * as os from 'os';
import { PanelSettings, CustomScript } from './../models/PanelSettings';
import { CancellationToken, Disposable, Uri, Webview, WebviewView, WebviewViewProvider, WebviewViewResolveContext, window, workspace, commands, env as vscodeEnv } from "vscode";
import { DefaultFields, SETTING_PANEL_FREEFORM, SETTING_SEO_DESCRIPTION_LENGTH, SETTING_SEO_TITLE_LENGTH, SETTING_SLUG_PREFIX, SETTING_SLUG_SUFFIX, SETTING_TAXONOMY_CATEGORIES, SETTING_TAXONOMY_TAGS } from "../constants";
import { ArticleHelper, SettingsHelper } from "../helpers";
import { Command } from "../viewpanel/Command";
import { CommandToCode } from '../viewpanel/CommandToCode';
import { Article } from '../commands';
import { TagType } from '../viewpanel/TagType';
import { TaxonomyType } from '../models';
import { exec } from 'child_process';
import * as path from 'path';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { Content } from 'mdast';
import { Notifications } from '../helpers/Notifications';
import { COMMAND_NAME } from '../constants/Extension';
import { Folders } from '../commands/Folders';
import { Preview } from '../commands/Preview';
import { openFileInEditor } from '../helpers/openFileInEditor';
import { WebviewHelper } from '@estruyf/vscode';
import { Extension } from '../helpers/Extension';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const FILE_LIMIT = 10;

export class ExplorerView implements WebviewViewProvider, Disposable {
  public static readonly viewType = "frontMatter.explorer";
  private static instance: ExplorerView;

  private panel: WebviewView | null = null;
  private disposable: Disposable | null = null;

  private constructor(private readonly extPath: Uri) {}

  /**
   * Creates the singleton instance for the panel
   * @param extPath 
   */
  public static getInstance(extPath?: Uri): ExplorerView {
    if (!ExplorerView.instance) {
      ExplorerView.instance = new ExplorerView(extPath as Uri);
    }

    return ExplorerView.instance;
  }

  /**
   * Retrieve the visibility of the webview
   */
  get visible() {
		return this.panel ? this.panel.visible : false;
  }
  
  /**
   * Webview panel dispose
   */
  public dispose() {
		if (this.disposable) {
      this.disposable.dispose();
    } 
	}

  /**
   * Default resolve webview panel
   * @param webviewView 
   * @param context 
   * @param token 
   */
  public async resolveWebviewView(webviewView: WebviewView, context: WebviewViewResolveContext, token: CancellationToken): Promise<void> {

    this.panel = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      enableCommandUris: true
    };

    webviewView.webview.html = this.getWebviewContent(webviewView.webview);

    this.disposable = Disposable.from(
			webviewView.onDidDispose(() => { webviewView.webview.html = ""; }, this),
    );
    
    webviewView.webview.onDidReceiveMessage(async (msg) => {
      switch(msg.command) {
        case CommandToCode.getData:
          this.getSettings();
          this.getFoldersAndFiles();
          this.getFileData();
          break;
        case CommandToCode.updateSlug:
          Article.generateSlug();
          break;
        case CommandToCode.updateLastMod:
          Article.setLastModifiedDate();
          break;
        case CommandToCode.publish:
          Article.toggleDraft();
          break;
        case CommandToCode.updateTags:
          this.updateTags(TagType.tags, msg.data || []);
          break;
        case CommandToCode.updateCategories:
          this.updateTags(TagType.categories, msg.data || []);
          break;
        case CommandToCode.updateKeywords:
          this.updateTags(TagType.keywords, msg.data || []);
          break;
        case CommandToCode.addTagToSettings:
          this.addTags(TagType.tags, msg.data);
          break;
        case CommandToCode.addCategoryToSettings:
          this.addTags(TagType.categories, msg.data);
          break;
        case CommandToCode.openSettings:
          commands.executeCommand('workbench.action.openSettings', '@ext:eliostruyf.vscode-front-matter');
          break;
        case CommandToCode.openFile:
          if (os.type() === "Linux" && vscodeEnv.remoteName?.toLowerCase() === "wsl") {
            commands.executeCommand('remote-wsl.revealInExplorer');
          } else {
            commands.executeCommand('revealFileInOS');
          }
          break;
        case CommandToCode.runCustomScript:
          this.runCustomScript(msg);
          break;
        case CommandToCode.openProject:
          const wsFolder = Folders.getWorkspaceFolder();
          if (wsFolder) {
            const wsPath = wsFolder.fsPath;
            if (os.type() === "Darwin") {
              exec(`open ${wsPath}`);
            } else if (os.type() === "Windows_NT") {
              exec(`explorer ${wsPath}`);
            } else if (os.type() === "Linux" && vscodeEnv.remoteName?.toLowerCase() === "wsl") {
              exec('explorer.exe `wslpath -w "$PWD"`');
            } else {
              exec(`xdg-open ${wsPath}`);
            }
          }
          break;
        case CommandToCode.initProject:
          await commands.executeCommand(COMMAND_NAME.init);
          this.getSettings();
          break;
        case CommandToCode.createContent:
          await commands.executeCommand(COMMAND_NAME.createContent);
          break;
        case CommandToCode.createTemplate:
          await commands.executeCommand(COMMAND_NAME.createTemplate);
          break;
        case CommandToCode.updateModifiedUpdating:
          this.updateModifiedUpdating(msg.data || false);
          break;
        case CommandToCode.toggleWritingSettings:
          this.toggleWritingSettings();
          break;
        case CommandToCode.updateFmHighlight:
          this.updateFmHighlight((msg.data !== null && msg.data !== undefined) ? msg.data : false);
          break;
        case CommandToCode.toggleCenterMode:
          await commands.executeCommand(`workbench.action.toggleCenteredLayout`);
          break;
        case CommandToCode.openPreview:
          await commands.executeCommand(COMMAND_NAME.preview);
          break;
        case CommandToCode.openDashboard:
          await commands.executeCommand(COMMAND_NAME.dashboard);
          break;
        case CommandToCode.updatePreviewUrl:
          this.updatePreviewUrl(msg.data || "");
          break;
        case CommandToCode.openInEditor:
          openFileInEditor(msg.data);
          break;
        case CommandToCode.updateMetadata:
          this.updateMetadata(msg.data);
          break;
        case CommandToCode.selectImage:
          await commands.executeCommand(`frontMatter.dashboard`, {
            type: "media",
            data: msg.data
          } as DashboardData);
          break;
      }
    });

    webviewView.onDidChangeVisibility(() => {
      if (this.visible) {
        // this.getFileData();
      }
    });

    window.onDidChangeActiveTextEditor(() => {
      this.postWebviewMessage({ command: Command.loading, data: true });
      if (this.visible) {
        this.getFileData();
      }
    }, this);

    workspace.onDidChangeConfiguration(() => {
      this.getSettings();
    });
  }

  /**
   * Triggers a metadata change in the panel
   * @param metadata 
   */
  public pushMetadata(metadata: any) {
    const wsFolder = Folders.getWorkspaceFolder();
    const filePath = window.activeTextEditor?.document.uri.fsPath;
    const config = SettingsHelper.getConfig();
    const commaSeparated = config.get<string[]>(SETTING_COMMA_SEPARATED_FIELDS);
    const staticFolder = config.get<string>(SETTINGS_CONTENT_STATIC_FOLDERS);
    const contentTypes = config.get<string>(SETTING_TAXONOMY_CONTENT_TYPES);
    
    const articleDetails = this.getArticleDetails();

    if (articleDetails) {
      metadata.articleDetails = articleDetails;
    }

    let updatedMetadata = Object.assign({}, metadata);
    if (commaSeparated) {
      for (const key of commaSeparated) {
        if (updatedMetadata[key] && typeof updatedMetadata[key] === "string") {
          updatedMetadata[key] = updatedMetadata[key].split(",").map((s: string) => s.trim());
        }
      }
    }

    const keys = Object.keys(updatedMetadata);
    if (keys.length > 0) {
      updatedMetadata.filePath = filePath;
    }

    if (keys.length > 0 && contentTypes && wsFolder) {
      // Get the current content type
      const contentType = ArticleHelper.getContentType(updatedMetadata);
      if (contentType) {
        const imageFields = contentType.fields.filter((field) => field.type === "image");
        for (const field of imageFields) {
          const staticPath = join(wsFolder.fsPath, staticFolder || "", updatedMetadata[field.name]);
          const contentFolderPath = filePath ? join(dirname(filePath), updatedMetadata[field.name]) : null;

          let previewUri = null;
          if (existsSync(staticPath)) {
            previewUri = Uri.file(staticPath);
          } else if (contentFolderPath && existsSync(contentFolderPath)) {
            previewUri = Uri.file(contentFolderPath);
          }

          if (previewUri) {
            const preview = this.panel?.webview.asWebviewUri(previewUri);
            updatedMetadata[field.name]= preview?.toString() || "";
          } else {
            updatedMetadata[field.name] = "";
          }
        }
      }
    }
    
    this.postWebviewMessage({ command: Command.metadata, data: {
      ...updatedMetadata
    }});
  }

  /**
   * Allows the webview panel to focus on tags or categories input
   * @param tagType 
   */
  public triggerInputFocus(tagType: TagType) {
    if (tagType === TagType.tags) {
      this.postWebviewMessage({ command: Command.focusOnTags });
    } else {
      this.postWebviewMessage({ command: Command.focusOnCategories });
    }
  }

  /**
   * Trigger all sections to close
   */
  public collapseAll() {
    this.postWebviewMessage({ command: Command.closeSections });
  }

  /**
   * Update the metadata of the article
   */
  public async updateMetadata({field, value}: { field: string, value: string }) {
    if (!field) {
      return;
    }

    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (!article) {
      return;
    }

    const contentType = ArticleHelper.getContentType(article.data);
    const dateFields = contentType.fields.filter((field) => field.type === "datetime");

    for (const dateField of dateFields) {
      if ((field === dateField.name) && value) {
        article.data[field] = Article.formatDate(new Date(value));
      } else {
        article.data[field] = value;
      }
    }
    
    ArticleHelper.update(editor, article);
    this.pushMetadata(article.data);
  }

  /**
   * Run a custom script
   * @param msg 
   */
  private runCustomScript(msg: { command: string, data: any}) {
    const config = SettingsHelper.getConfig();
    const scripts: CustomScript[] | undefined = config.get(SETTING_CUSTOM_SCRIPTS);

    if (msg?.data?.title && msg?.data?.script && scripts) {
      const customScript = scripts.find((s: CustomScript) => s.title === msg.data.title);
      if (customScript?.script && customScript?.title) {
        const editor = window.activeTextEditor;
        if (!editor) return;

        const article = ArticleHelper.getFrontMatter(editor);

        const wsFolder = Folders.getWorkspaceFolder();
        if (wsFolder) {
          const wsPath = wsFolder.fsPath;

          let articleData = `'${JSON.stringify(article?.data)}'`;
          if (os.type() === "Windows_NT") {
            articleData = `"${JSON.stringify(article?.data).replace(/"/g, `""`)}"`;
          }

          exec(`${customScript.nodeBin || "node"} ${path.join(wsPath, msg.data.script)} "${wsPath}" "${editor?.document.uri.fsPath}" ${articleData}`, (error, stdout) => {
            if (error) {
              Notifications.error(`${msg?.data?.title}: ${error.message}`);
              return;
            }

            window.showInformationMessage(`${msg?.data?.title}: ${stdout || "Executed your custom script."}`, 'Copy output').then(value => {
              if (value === 'Copy output') {
                vscodeEnv.clipboard.writeText(stdout);
              }
            });
          });
        }
      }
    }
  }

  /**
   * Retrieve the extension settings
   */
  public async getSettings() {
    const config = SettingsHelper.getConfig();

    this.postWebviewMessage({
      command: Command.settings,
      data: {
        seo: {
          title: config.get(SETTING_SEO_TITLE_LENGTH) as number || -1,
          description: config.get(SETTING_SEO_DESCRIPTION_LENGTH) as number || -1,
          content: config.get(SETTING_SEO_CONTENT_MIN_LENGTH) as number || -1,
          descriptionField: config.get(SETTING_SEO_DESCRIPTION_FIELD) as string || DefaultFields.Description
        },
        slug: {
          prefix: config.get(SETTING_SLUG_PREFIX) || "",
          suffix: config.get(SETTING_SLUG_SUFFIX) || "",
          updateFileName: !!config.get<boolean>(SETTING_SLUG_UPDATE_FILE_NAME),
        },
        date: {
          format: config.get(SETTING_DATE_FORMAT)
        },
        tags: config.get(SETTING_TAXONOMY_TAGS) || [],
        categories: config.get(SETTING_TAXONOMY_CATEGORIES) || [],
        freeform: config.get(SETTING_PANEL_FREEFORM),
        scripts: config.get(SETTING_CUSTOM_SCRIPTS),
        isInitialized: await Template.isInitialized(),
        modifiedDateUpdate: config.get(SETTING_AUTO_UPDATE_DATE) || false,
        writingSettingsEnabled: this.isWritingSettingsEnabled() || false,
        fmHighlighting: config.get(SETTINGS_CONTENT_FRONTMATTER_HIGHLIGHT),
        preview: Preview.getSettings(),
        commaSeparatedFields: config.get(SETTING_COMMA_SEPARATED_FIELDS) || [],
        contentTypes: config.get(SETTING_TAXONOMY_CONTENT_TYPES) || [],
      } as PanelSettings
    });
  }

  /**
   * Retrieve the information about the registered folders and its files
   */
  public async getFoldersAndFiles() {
    this.postWebviewMessage({
      command: Command.folderInfo,
      data: await Folders.getInfo(FILE_LIMIT) || null
    });
  }

  /**
   * Retrieve the file its front matter
   */
  private getFileData() {
    const editor = window.activeTextEditor;
    if (!editor) {
      return "";
    }

    const article = ArticleHelper.getFrontMatter(editor);
    this.pushMetadata(article!.data);
  }

  /**
   * Update the tags in the current document
   * @param tagType 
   * @param values 
   */
  private updateTags(tagType: TagType, values: string[]) {
    const editor = window.activeTextEditor;
    if (!editor) {
      return "";
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (article && article.data) {
      article.data[tagType.toLowerCase()] = values || [];
      ArticleHelper.update(editor, article);
      this.pushMetadata(article!.data);
    }
  }

  /**
   * Add tag to the settings
   * @param tagType 
   * @param value 
   */
  private async addTags(tagType: TagType, value: string) {
    if (value) {
      const config = SettingsHelper.getConfig();
      let options = tagType === TagType.tags ? config.get<string[]>(SETTING_TAXONOMY_TAGS) : config.get<string[]>(SETTING_TAXONOMY_CATEGORIES);

      if (!options) {
        options = [];
      }

      options.push(value);
      const taxType = tagType === TagType.tags ? TaxonomyType.Tag : TaxonomyType.Category;
      await SettingsHelper.update(taxType, options);
    }
  }

  /**
   * Get article details
   */
  private getArticleDetails() {
    const editor = window.activeTextEditor;
    if (!editor) {
      return null;
    }

    if (!ArticleHelper.isMarkdownFile()) {
      return null;
    }

    const article = ArticleHelper.getFrontMatter(editor);

    if (article && article.content) {
      let content = article.content;
      content = content.replace(/({{(.*?)}})/g, ''); // remove hugo shortcodes
      
      const mdTree = fromMarkdown(content);
      const headings = mdTree.children.filter(node => node.type === 'heading').length;
      const paragraphs = mdTree.children.filter(node => node.type === 'paragraph').length;
      const wordCount = this.wordCount(0, mdTree);

      return {
        headings,
        paragraphs,
        wordCount,
        content: article.content
      };
    }

    return null;
  }

  private counts(acc: any, node: any) {
    // add 1 to an initial or existing value
    acc[node.type] = (acc[node.type] || 0) + 1;
  
    // find and add up the counts from all of this node's children
    return (node.children || []).reduce(
      (childAcc: any, childNode: any) => this.counts(childAcc, childNode),
      acc
    );
  }

  /**
   * Get the word count for the current document
   */
  private wordCount(count: number, node: Content | any) {
    if (node.type === "text") {
      return count + node.value.split(" ").length;
    } else {
      return (node.children || []).reduce((childCount: number, childNode: any) => this.wordCount(childCount, childNode), count);
    }
  }

  /**
   * Toggle the writing settings
   */
  private async toggleWritingSettings() {
    const config = workspace.getConfiguration("", { languageId: "markdown" });
    const enabled = this.isWritingSettingsEnabled();
    
    await config.update("editor.fontSize", enabled ? undefined : 14, false, true);
    await config.update("editor.lineHeight", enabled ? undefined : 26, false, true);
    await config.update("editor.wordWrap", enabled ? undefined : "wordWrapColumn", false, true);
    await config.update("editor.wordWrapColumn", enabled ? undefined : 64, false, true);
    await config.update("editor.lineNumbers", enabled ? undefined : "off", false, true);
    await config.update("editor.quickSuggestions", enabled ? undefined : false, false, true);
    await config.update("editor.minimap.enabled", enabled ? undefined : false, false, true);

    this.getSettings();
  }

  /**
   * Check if the writing settings are enabled
   */
  private isWritingSettingsEnabled() {
    const config = workspace.getConfiguration("", { languageId: "markdown" });
    
    const fontSize = config.get("editor.fontSize");
    const lineHeight = config.get("editor.lineHeight");
    const wordWrap = config.get("editor.wordWrap");
    const wordWrapColumn = config.get("editor.wordWrapColumn");
    const lineNumbers = config.get("editor.lineNumbers");
    const quickSuggestions = config.get<boolean>("editor.quickSuggestions");

    return fontSize && lineHeight && wordWrap && wordWrapColumn && lineNumbers && quickSuggestions !== undefined;
  }

  /**
   * Update the preview URL
   */
  private async updatePreviewUrl(previewUrl: string) {
    const config = SettingsHelper.getConfig();
    await config.update(SETTING_PREVIEW_HOST, previewUrl);
    this.getSettings();
  }

  /**
   * Toggle the Front Matter highlighting
   */
  private async updateFmHighlight(autoUpdate: boolean) {
    const config = SettingsHelper.getConfig();
    await config.update(SETTINGS_CONTENT_FRONTMATTER_HIGHLIGHT, autoUpdate);
    this.getSettings();
  }

  /**
   * Toggle the modified auto-update setting
   */
  private async updateModifiedUpdating(autoUpdate: boolean) {
    const config = SettingsHelper.getConfig();
    await config.update(SETTING_AUTO_UPDATE_DATE, autoUpdate);
    this.getSettings();
  }

  /**
   * Post data to the panel
   * @param msg 
   */
  private postWebviewMessage(msg: { command: Command, data?: any }) {
    this.panel?.webview?.postMessage(msg);
  }

  /**
   * Retrieve the webview HTML contents
   * @param webView 
   */
  private getWebviewContent(webView: Webview): string {
    const styleVSCodeUri = webView.asWebviewUri(Uri.joinPath(this.extPath, 'assets/media', 'vscode.css'));
    const styleResetUri = webView.asWebviewUri(Uri.joinPath(this.extPath, 'assets/media', 'reset.css'));
    const stylesUri = webView.asWebviewUri(Uri.joinPath(this.extPath, 'assets/media', 'styles.css'));
    const scriptUri = webView.asWebviewUri(Uri.joinPath(this.extPath, 'dist', 'viewpanel.js'));

    const nonce = WebviewHelper.getNonce();

    const version = Extension.getInstance().getVersion();

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${`vscode-file://vscode-app`} ${webView.cspSource} https://api.visitorbadge.io 'self' 'unsafe-inline'; script-src 'nonce-${nonce}'; style-src ${webView.cspSource} 'self' 'unsafe-inline'; font-src ${webView.cspSource}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleResetUri}" rel="stylesheet">
        <link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${stylesUri}" rel="stylesheet">

        <title>Front Matter</title>
      </head>
      <body>
        <div id="app"></div>

        <img style="display:none" src="https://api.visitorbadge.io/api/combined?user=estruyf&repo=frontmatter-usage&countColor=%23263759&slug=${`panel-${version.installedVersion}`}" alt="Daily usage" />

        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}
