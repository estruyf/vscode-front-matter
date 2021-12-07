import { DashboardData } from '../models/DashboardData';
import { Template } from '../commands/Template';
import { DefaultFields, SETTINGS_CONTENT_FRONTMATTER_HIGHLIGHT, SETTING_AUTO_UPDATE_DATE, SETTING_CUSTOM_SCRIPTS, SETTING_SEO_CONTENT_MIN_LENGTH, SETTING_SEO_DESCRIPTION_FIELD, SETTING_SLUG_UPDATE_FILE_NAME, SETTING_PREVIEW_HOST, SETTING_DATE_FORMAT, SETTING_COMMA_SEPARATED_FIELDS, SETTING_TAXONOMY_CONTENT_TYPES, SETTING_PANEL_FREEFORM, SETTING_SEO_DESCRIPTION_LENGTH, SETTING_SEO_TITLE_LENGTH, SETTING_SLUG_PREFIX, SETTING_SLUG_SUFFIX, SETTING_TAXONOMY_CATEGORIES, SETTING_TAXONOMY_TAGS, SETTINGS_CONTENT_DRAFT_FIELD, SETTING_SEO_SLUG_LENGTH, SETTING_SITE_BASEURL, SETTING_TAXONOMY_CUSTOM } from '../constants';
import * as os from 'os';
import { PanelSettings, CustomScript as ICustomScript } from '../models/PanelSettings';
import { CancellationToken, Disposable, Uri, Webview, WebviewView, WebviewViewProvider, WebviewViewResolveContext, window, workspace, commands, env as vscodeEnv } from "vscode";
import { ArticleHelper, Settings } from "../helpers";
import { Command } from "../panelWebView/Command";
import { CommandToCode } from '../panelWebView/CommandToCode';
import { Article } from '../commands';
import { TagType } from '../panelWebView/TagType';
import { CustomTaxonomyData, DraftField, ScriptType, TaxonomyType } from '../models';
import { exec } from 'child_process';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { Content } from 'mdast';
import { COMMAND_NAME, EXTENSION_BETA_ID, EXTENSION_ID } from '../constants/Extension';
import { Folders } from '../commands/Folders';
import { Preview } from '../commands/Preview';
import { openFileInEditor } from '../helpers/openFileInEditor';
import { WebviewHelper } from '@estruyf/vscode';
import { Extension } from '../helpers/Extension';
import { Dashboard } from '../commands/Dashboard';
import { ImageHelper } from '../helpers/ImageHelper';
import { CustomScript } from '../helpers/CustomScript';
import { Link, Parent } from 'mdast-util-from-markdown/lib';

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
        case CommandToCode.updateCustomTaxonomy:
          this.updateCustomTaxonomy(msg.data);
          break;
        case CommandToCode.addTagToSettings:
          this.addTags(TagType.tags, msg.data);
          break;
        case CommandToCode.addCategoryToSettings:
          this.addTags(TagType.categories, msg.data);
          break;
        case CommandToCode.addToCustomTaxonomy:
          this.addCustomTaxonomy(msg.data);
          break;
        case CommandToCode.openSettings:
          const isBeta = Extension.getInstance().isBetaVersion();
          commands.executeCommand('workbench.action.openSettings', `@ext:${isBeta ? EXTENSION_BETA_ID : EXTENSION_ID}`);
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
          await commands.executeCommand(COMMAND_NAME.dashboard, {
            type: "media",
            data: msg.data
          } as DashboardData);
          this.getMediaSelection();
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

    Settings.onConfigChange((global?: any) => {
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
    const commaSeparated = Settings.get<string[]>(SETTING_COMMA_SEPARATED_FIELDS);
    const contentTypes = Settings.get<string>(SETTING_TAXONOMY_CONTENT_TYPES);
    
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
          if (updatedMetadata[field.name]) {
            const imageData = ImageHelper.allRelToAbs(field, updatedMetadata[field.name])

            if (imageData) {
              if (field.multiple && imageData instanceof Array) {
                const preview = imageData.map(preview => preview && preview.absPath ? ({ 
                  ...preview,
                  webviewUrl: this.panel?.webview.asWebviewUri(preview.absPath).toString()
                }) : null);

                updatedMetadata[field.name] = preview || [];
              } else if (!field.multiple && !Array.isArray(imageData) && imageData.absPath) {
                const preview = this.panel?.webview.asWebviewUri(imageData.absPath);
                updatedMetadata[field.name] = {
                  ...imageData,
                  webviewUrl: preview ? preview.toString() : null
                };
              }
            } else {
              updatedMetadata[field.name] = field.multiple ? [] : "";
            }
          }          
        }
      }
    }

    // Check slug
    if (!updatedMetadata[DefaultFields.Slug]) {
      const slug = Article.getSlug();

      if (slug) {
        updatedMetadata[DefaultFields.Slug] = slug;
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
  public async updateMetadata({field, value }: { field: string, value: any, fieldData?: { multiple: boolean, value: string[] } }) {
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
    const imageFields = contentType.fields.filter((field) => field.type === "image" && field.multiple);

    for (const dateField of dateFields) {
      if ((field === dateField.name) && value) {
        article.data[field] = Article.formatDate(new Date(value));
      } else if (!imageFields.find(f => f.name === field)) {
        // Only override the field data if it is not an multiselect image field
        article.data[field] = value;
      }
    }

    for (const imageField of imageFields) {
      if (field === imageField.name) {
        // If value is an array, it means it comes from the explorer view itself (deletion)
        if (Array.isArray(value)) {
          article.data[field] = value || [];
        } else { // Otherwise it is coming from the media dashboard (addition)
          let fieldValue = article.data[field];
          if (fieldValue && !Array.isArray(fieldValue)) {
            fieldValue = [fieldValue];
          }
          const crntData = Object.assign([], fieldValue);
          const allRelPaths = [...(crntData || []), value];
          article.data[field] = [...new Set(allRelPaths)].filter(f => f);
        }
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
    const scripts: ICustomScript[] | undefined = Settings.get(SETTING_CUSTOM_SCRIPTS);

    if (msg?.data?.title && msg?.data?.script && scripts) {
      const customScript = scripts.find((s: ICustomScript) => s.title === msg.data.title);
      if (customScript?.script && customScript?.title) {
        CustomScript.run(customScript);
      }
    }
  }

  /**
   * Return the media selection
   */
  public async getMediaSelection() {
    this.postWebviewMessage({
      command: Command.mediaSelectionData,
      data: Dashboard.viewData
    });
  }

  /**
   * Retrieve the extension settings
   */
  public async getSettings() {
    this.postWebviewMessage({
      command: Command.settings,
      data: {
        seo: {
          title: Settings.get(SETTING_SEO_TITLE_LENGTH) as number || -1,
          slug: Settings.get(SETTING_SEO_SLUG_LENGTH) as number || -1,
          description: Settings.get(SETTING_SEO_DESCRIPTION_LENGTH) as number || -1,
          content: Settings.get(SETTING_SEO_CONTENT_MIN_LENGTH) as number || -1,
          descriptionField: Settings.get(SETTING_SEO_DESCRIPTION_FIELD) as string || DefaultFields.Description
        },
        slug: {
          prefix: Settings.get(SETTING_SLUG_PREFIX) || "",
          suffix: Settings.get(SETTING_SLUG_SUFFIX) || "",
          updateFileName: !!Settings.get<boolean>(SETTING_SLUG_UPDATE_FILE_NAME),
        },
        date: {
          format: Settings.get(SETTING_DATE_FORMAT)
        },
        tags: Settings.get(SETTING_TAXONOMY_TAGS, true) || [],
        categories: Settings.get(SETTING_TAXONOMY_CATEGORIES, true) || [],
        customTaxonomy: Settings.get(SETTING_TAXONOMY_CUSTOM, true) || [],
        freeform: Settings.get(SETTING_PANEL_FREEFORM),
        scripts: (Settings.get<ICustomScript[]>(SETTING_CUSTOM_SCRIPTS) || []).filter(s => s.type === ScriptType.Content || !s.type),
        isInitialized: await Template.isInitialized(),
        modifiedDateUpdate: Settings.get(SETTING_AUTO_UPDATE_DATE) || false,
        writingSettingsEnabled: this.isWritingSettingsEnabled() || false,
        fmHighlighting: Settings.get(SETTINGS_CONTENT_FRONTMATTER_HIGHLIGHT),
        preview: Preview.getSettings(),
        commaSeparatedFields: Settings.get(SETTING_COMMA_SEPARATED_FIELDS) || [],
        contentTypes: Settings.get(SETTING_TAXONOMY_CONTENT_TYPES) || [],
        dashboardViewData: Dashboard.viewData,
        draftField: Settings.get<DraftField>(SETTINGS_CONTENT_DRAFT_FIELD)
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
    if (article?.data) {
      this.pushMetadata(article!.data);
    }
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
   * Update the tags in the current document
   * @param data 
   */
  private updateCustomTaxonomy(data: CustomTaxonomyData) {
    if (!data?.id || !data?.name) {
      return;
    }

    const editor = window.activeTextEditor;
    if (!editor) {
      return "";
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (article && article.data) {
      article.data[data.name] = data.options || [];
      ArticleHelper.update(editor, article);
      this.pushMetadata(article!.data);
    }
  }

  /**
   * Add tag to the settings
   * @param data 
   */
  private async addCustomTaxonomy(data: CustomTaxonomyData) {
    if (!data?.id || !data?.option) {
      return;
    }

    await Settings.updateCustomTaxonomy(data.id, data.option);
  }

  /**
   * Add tag to the settings
   * @param tagType 
   * @param value 
   */
  private async addTags(tagType: TagType, value: string) {
    if (value) {
      let options = tagType === TagType.tags ? Settings.get<string[]>(SETTING_TAXONOMY_TAGS, true) : Settings.get<string[]>(SETTING_TAXONOMY_CATEGORIES, true);

      if (!options) {
        options = [];
      }

      options.push(value);
      const taxType = tagType === TagType.tags ? TaxonomyType.Tag : TaxonomyType.Category;
      await Settings.updateTaxonomy(taxType, options);
    }
  }

  /**
   * Get article details
   */
  private getArticleDetails() {
    const baseUrl = Settings.get<string>(SETTING_SITE_BASEURL);
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
      const elms: Parent[] | Link[] = this.getAllElms(mdTree);

      const headings = elms.filter(node => node.type === 'heading');
      const paragraphs = elms.filter(node => node.type === 'paragraph').length;
      const images = elms.filter(node => node.type === 'image').length;
      const links: string[] = elms.filter(node => node.type === 'link').map(node => (node as Link).url);

      const internalLinks = links.filter(link => !link.startsWith('http') || (baseUrl && link.toLowerCase().includes((baseUrl || "").toLowerCase()))).length;
      let externalLinks = links.filter(link => link.startsWith('http'));
      if (baseUrl) {
        externalLinks = externalLinks.filter(link => !link.toLowerCase().includes(baseUrl.toLowerCase()));
      }

      const headers = [];
      for (const header of headings) { 
        const text = header?.children?.filter((node: any) => node.type === 'text').map((node: any) => node.value).join(" ");
        if (text) {
          headers.push(text);
        }
      }
      
      const wordCount = this.wordCount(0, mdTree);

      return {
        headings: headings.length,
        headingsText: headers,
        paragraphs,
        images,
        internalLinks,
        externalLinks: externalLinks.length,
        wordCount,
        content: article.content
      };
    }

    return null;
  }

  private getAllElms(node: Content | any, allElms?: any[]): any[] {
    if (!allElms) {
      allElms = [];
    }

    if (node.children?.length > 0) {
      for (const child of node.children) {
        allElms.push(Object.assign({}, child));
        this.getAllElms(child, allElms);
      }
    }

    return allElms;
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
    await Settings.update(SETTING_PREVIEW_HOST, previewUrl);
    this.getSettings();
  }

  /**
   * Toggle the Front Matter highlighting
   */
  private async updateFmHighlight(autoUpdate: boolean) {
    await Settings.update(SETTINGS_CONTENT_FRONTMATTER_HIGHLIGHT, autoUpdate);
    this.getSettings();
  }

  /**
   * Toggle the modified auto-update setting
   */
  private async updateModifiedUpdating(autoUpdate: boolean) {
    await Settings.update(SETTING_AUTO_UPDATE_DATE, autoUpdate);
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

    const ext = Extension.getInstance();
    const version = ext.getVersion();
    const isBeta = ext.isBetaVersion();

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${`vscode-file://vscode-app`} ${webView.cspSource} https://api.visitorbadge.io 'self' 'unsafe-inline'; script-src 'nonce-${nonce}'; style-src ${webView.cspSource} 'self' 'unsafe-inline'; font-src ${webView.cspSource}; connect-src https://o1022172.ingest.sentry.io">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleResetUri}" rel="stylesheet">
        <link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${stylesUri}" rel="stylesheet">

        <title>Front Matter</title>
      </head>
      <body>
        <div id="app" data-environment="${isBeta ? "BETA" : "main"}" data-version="${version.usedVersion}" ></div>

        <img style="display:none" src="https://api.visitorbadge.io/api/combined?user=estruyf&repo=frontmatter-usage&countColor=%23263759&slug=${`panel-${version.installedVersion}`}" alt="Daily usage" />

        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}
