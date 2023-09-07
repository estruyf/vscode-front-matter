import { GitListener } from './listeners/general/GitListener';
import * as vscode from 'vscode';
import { COMMAND_NAME, TelemetryEvent } from './constants';
import { MarkdownFoldingProvider } from './providers/MarkdownFoldingProvider';
import { TagType } from './panelWebView/TagType';
import { PanelProvider } from './panelWebView/PanelProvider';
import {
  DashboardSettings,
  debounceCallback,
  Logger,
  parseWinPath,
  Settings as SettingsHelper
} from './helpers';
import ContentProvider from './providers/ContentProvider';
import { PagesListener } from './listeners/dashboard';
import { NavigationType } from './dashboardWebView/models';
import { ModeSwitch } from './services/ModeSwitch';
import { PagesParser } from './services/PagesParser';
import { ContentType, Telemetry, Extension } from './helpers';
import { TaxonomyType, DashboardData } from './models';
import * as l10n from '@vscode/l10n';
import {
  Backers,
  Diagnostics,
  Wysiwyg,
  Content,
  Cache,
  Template,
  Project,
  Preview,
  Folders,
  Dashboard,
  Article,
  Settings,
  StatusListener,
  Chatbot
} from './commands';
import { join } from 'path';

let frontMatterStatusBar: vscode.StatusBarItem;
let statusDebouncer: { (fnc: any, time: number): void };
let editDebounce: { (fnc: any, time: number): void };
let collection: vscode.DiagnosticCollection;

export async function activate(context: vscode.ExtensionContext) {
  const { subscriptions, extensionUri, extensionPath } = context;

  const extension = Extension.getInstance(context);
  Backers.init(context).then(() => {});

  // Make sure the EN language file is loaded
  if (!vscode.l10n.uri) {
    l10n.config({
      fsPath: vscode.Uri.file(join(parseWinPath(extensionPath), `/l10n/bundle.l10n.json`)).fsPath
    });
  } else {
    l10n.config({
      fsPath: vscode.l10n.uri.fsPath
    });
  }

  if (!extension.checkIfExtensionCanRun()) {
    return undefined;
  }

  await SettingsHelper.init();
  extension.migrateSettings();

  SettingsHelper.checkToPromote();

  // Sends the activation event
  Telemetry.send(TelemetryEvent.activate);

  // Start listening to the folders for content changes.
  // This will make sure the dashboard is up to date
  PagesListener.startWatchers();

  collection = vscode.languages.createDiagnosticCollection('frontMatter');

  // Pages dashboard
  Dashboard.init();
  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAME.dashboard, (data?: DashboardData) => {
      Telemetry.send(TelemetryEvent.openContentDashboard);
      if (!data) {
        Dashboard.open({ type: NavigationType.Contents });
      } else {
        Dashboard.open(data);
      }
    })
  );

  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAME.dashboardMedia, (data?: DashboardData) => {
      Telemetry.send(TelemetryEvent.openMediaDashboard);
      Dashboard.open({ type: NavigationType.Media });
    })
  );

  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAME.dashboardSnippets, (data?: DashboardData) => {
      Telemetry.send(TelemetryEvent.openSnippetsDashboard);
      Dashboard.open({ type: NavigationType.Snippets });
    })
  );

  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAME.dashboardData, (data?: DashboardData) => {
      Telemetry.send(TelemetryEvent.openDataDashboard);
      Dashboard.open({ type: NavigationType.Data });
    })
  );

  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAME.dashboardTaxonomy, (data?: DashboardData) => {
      Telemetry.send(TelemetryEvent.openTaxonomyDashboard);
      Dashboard.open({ type: NavigationType.Taxonomy });
    })
  );

  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAME.dashboardClose, (data?: DashboardData) => {
      Telemetry.send(TelemetryEvent.closeDashboard);
      Dashboard.close();
    })
  );

  if (!extension.getVersion().usedVersion) {
    vscode.commands.executeCommand(COMMAND_NAME.dashboard);
  }

  // Register the explorer view
  const explorerSidebar = PanelProvider.getInstance(extensionUri);
  const PanelView = vscode.window.registerWebviewViewProvider(
    PanelProvider.viewType,
    explorerSidebar,
    {
      webviewOptions: {
        retainContextWhenHidden: true
      }
    }
  );

  // Folding the front matter of markdown files
  MarkdownFoldingProvider.register();

  const insertTags = vscode.commands.registerCommand(COMMAND_NAME.insertTags, async () => {
    await vscode.commands.executeCommand('workbench.view.extension.frontmatter-explorer');
    await vscode.commands.executeCommand('workbench.action.focusSideBar');
    explorerSidebar.triggerInputFocus(TagType.tags);
  });

  const insertCategories = vscode.commands.registerCommand(
    COMMAND_NAME.insertCategories,
    async () => {
      await vscode.commands.executeCommand('workbench.view.extension.frontmatter-explorer');
      await vscode.commands.executeCommand('workbench.action.focusSideBar');
      explorerSidebar.triggerInputFocus(TagType.categories);
    }
  );

  const createTag = vscode.commands.registerCommand(COMMAND_NAME.createTag, () => {
    Settings.create(TaxonomyType.Tag);
  });

  const createCategory = vscode.commands.registerCommand(COMMAND_NAME.createCategory, () => {
    Settings.create(TaxonomyType.Category);
  });

  const exportTaxonomy = vscode.commands.registerCommand(
    COMMAND_NAME.exportTaxonomy,
    Settings.export
  );

  const remap = vscode.commands.registerCommand(COMMAND_NAME.remap, Settings.remap);

  const setLastModifiedDate = vscode.commands.registerCommand(
    COMMAND_NAME.setLastModifiedDate,
    Article.setLastModifiedDate
  );

  const generateSlug = vscode.commands.registerCommand(
    COMMAND_NAME.generateSlug,
    Article.updateSlug
  );

  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAME.initTemplate, () =>
      Project.createSampleTemplate(true)
    )
  );

  const toggleDraftCommand = COMMAND_NAME.toggleDraft;
  const toggleDraft = vscode.commands.registerCommand(toggleDraftCommand, async () => {
    await Article.toggleDraft();
    triggerShowDraftStatus(`toggleDraft`);
  });

  // Register project folders
  const registerFolder = vscode.commands.registerCommand(
    COMMAND_NAME.registerFolder,
    Folders.register
  );

  const unregisterFolder = vscode.commands.registerCommand(
    COMMAND_NAME.unregisterFolder,
    Folders.unregister
  );

  const createFolder = vscode.commands.registerCommand(
    COMMAND_NAME.createFolder,
    Folders.addMediaFolder
  );

  /**
   * Template creation
   */
  const createTemplate = vscode.commands.registerCommand(
    COMMAND_NAME.createTemplate,
    Template.generate
  );
  const createFromTemplate = vscode.commands.registerCommand(
    COMMAND_NAME.createFromTemplate,
    (folder: vscode.Uri) => {
      const folderPath = Folders.getFolderPath(folder);
      if (folderPath) {
        Template.create(folderPath);
      }
    }
  );

  /**
   * Content creation
   */
  const createByContentType = vscode.commands.registerCommand(
    COMMAND_NAME.createByContentType,
    ContentType.createContent
  );
  const createByTemplate = vscode.commands.registerCommand(
    COMMAND_NAME.createByTemplate,
    Folders.create
  );
  const createContent = vscode.commands.registerCommand(COMMAND_NAME.createContent, Content.create);

  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAME.generateContentType, ContentType.generate)
  );

  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAME.addMissingFields, ContentType.addMissingFields)
  );

  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAME.setContentType, ContentType.setContentType)
  );

  // Initialize command
  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAME.init, async (cb: Function) => {
      await Project.init();

      if (cb) {
        cb();
      }
    })
  );

  // Settings promotion command
  subscriptions.push(vscode.commands.registerCommand(COMMAND_NAME.promote, SettingsHelper.promote));

  // Collapse all sections in the webview
  const collapseAll = vscode.commands.registerCommand(COMMAND_NAME.collapseSections, () => {
    PanelProvider.getInstance()?.collapseAll();
  });

  // Things to do when configuration changes
  SettingsHelper.startListening();

  // Create the status bar
  frontMatterStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  frontMatterStatusBar.command = toggleDraftCommand;
  subscriptions.push(frontMatterStatusBar);
  statusDebouncer = debounceCallback();

  // Register listeners that make sure the status bar updates
  subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() =>
      triggerShowDraftStatus(`onDidChangeActiveTextEditor`)
    )
  );
  subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((e) => {
      if (e.kind === vscode.TextEditorSelectionChangeKind.Mouse) {
        statusDebouncer(() => triggerShowDraftStatus(`onDidChangeTextEditorSelection`), 200);
      }
    })
  );
  subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((TextDocumentChangeEvent) => {
      const filePath = TextDocumentChangeEvent.document.uri.fsPath;
      if (filePath && !filePath.toLowerCase().startsWith(`extension-output`)) {
        MarkdownFoldingProvider.triggerHighlighting();
        statusDebouncer(() => triggerShowDraftStatus(`onDidChangeTextEditorSelection`), 200);
      }
    })
  );

  // Automatically run the command
  triggerShowDraftStatus(`triggerShowDraftStatus`);

  // Listener for file edit changes
  subscriptions.push(vscode.workspace.onWillSaveTextDocument(handleAutoDateUpdate));

  // Listener for file saves
  subscriptions.push(PagesListener.saveFileWatcher());

  // Webview for preview
  Preview.init();
  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAME.preview, () => Preview.open(extensionPath))
  );

  // Chat to the bot
  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAME.chatbot, () => Chatbot.open(extensionPath))
  );

  // Inserting an image in Markdown
  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAME.insertMedia, Article.insertMedia)
  );

  // Inserting a snippet in Markdown
  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAME.insertSnippet, Article.insertSnippet)
  );

  // Create the editor experience for bulk scripts
  subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      ContentProvider.scheme,
      new ContentProvider()
    )
  );

  // What you see, is what you get
  Wysiwyg.registerCommands(subscriptions);

  // Mode switching
  ModeSwitch.register();

  // Diagnostics
  subscriptions.push(vscode.commands.registerCommand(COMMAND_NAME.diagnostics, Diagnostics.show));

  // Git
  GitListener.init();

  // Once everything is registered, the page parsing can start in the background
  DashboardSettings.get();
  PagesParser.start();

  // Cache commands
  Cache.registerCommands();

  // Project switching
  Project.registerCommands();

  // Subscribe all commands
  subscriptions.push(
    insertTags,
    PanelView,
    insertCategories,
    createTag,
    createCategory,
    exportTaxonomy,
    remap,
    setLastModifiedDate,
    generateSlug,
    createFromTemplate,
    createTemplate,
    toggleDraft,
    registerFolder,
    unregisterFolder,
    createContent,
    createByContentType,
    createByTemplate,
    collapseAll,
    createFolder
  );

  console.log(`𝖥𝗋𝗈𝗇𝗍 𝖬𝖺𝗍𝗍𝖾𝗋 𝖢𝖬𝖲 𝖺𝖼𝗍𝗂𝗏𝖺𝗍𝖾𝖽! 𝖱𝖾𝖺𝖽𝗒 𝗍𝗈 𝗌𝗍𝖺𝗋𝗍 𝗐𝗋𝗂𝗍𝗂𝗇𝗀... 👩‍💻🧑‍💻👨‍💻`);
}

export function deactivate() {}

const handleAutoDateUpdate = (e: vscode.TextDocumentWillSaveEvent) => {
  Article.autoUpdate(e);
};

const triggerShowDraftStatus = (location: string) => {
  Logger.info(`Triggering draft status update: ${location}`);
  statusDebouncer(() => {
    StatusListener.verify(frontMatterStatusBar, collection);
  }, 1000);
};
