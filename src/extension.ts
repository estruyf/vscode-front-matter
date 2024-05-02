import { GitListener } from './listeners/general/GitListener';
import * as vscode from 'vscode';
import { COMMAND_NAME, CONTEXT, EXTENSION_NAME, TelemetryEvent } from './constants';
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
import { ModeSwitch } from './services/ModeSwitch';
import { PagesParser } from './services/PagesParser';
import { ContentType, Telemetry, Extension } from './helpers';
import { TaxonomyType } from './models';
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
import { Terminal } from './services';
import { i18n } from './commands/i18n';

let pageUpdateDebouncer: { (fnc: any, time: number): void };
let editDebounce: { (fnc: any, time: number): void };
let collection: vscode.DiagnosticCollection;

export async function activate(context: vscode.ExtensionContext) {
  const { subscriptions, extensionUri, extensionPath } = context;

  const extension = Extension.getInstance(context);

  Logger.info(`Activating ${EXTENSION_NAME} version ${Extension.getInstance().version}...`);
  Logger.info(`Logging level: ${Logger.getLevel()}`);

  // Set development context
  if (!Extension.getInstance().isProductionMode) {
    vscode.commands.executeCommand('setContext', CONTEXT.isDevelopment, true);
  }

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

  // Make sure the terminal windows are closed
  Terminal.closeLocalServerTerminal();

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
  Dashboard.registerCommands();

  i18n.register();

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

  // Register all the article commands
  Article.registerCommands(subscriptions);

  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAME.initTemplate, () =>
      Project.createSampleTemplate(true)
    )
  );

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
  let fmStatusBarItem = vscode.window.createStatusBarItem(
    'fm-statusBarItem',
    vscode.StatusBarAlignment.Right,
    -100
  );
  fmStatusBarItem.command = COMMAND_NAME.dashboard;
  fmStatusBarItem.text = `$(fm-logo)`;
  fmStatusBarItem.tooltip = EXTENSION_NAME;
  fmStatusBarItem.show();

  // Register listeners that make sure the status bar updates
  pageUpdateDebouncer = debounceCallback();
  subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() =>
      triggerPageUpdate(`onDidChangeActiveTextEditor`)
    )
  );
  subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((e) => {
      if (e.kind === vscode.TextEditorSelectionChangeKind.Mouse) {
        pageUpdateDebouncer(() => triggerPageUpdate(`onDidChangeTextEditorSelection`), 200);
      }
    })
  );
  subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((TextDocumentChangeEvent) => {
      const filePath = TextDocumentChangeEvent.document.uri.fsPath;
      if (filePath && !filePath.toLowerCase().startsWith(`extension-output`)) {
        MarkdownFoldingProvider.triggerHighlighting();
        pageUpdateDebouncer(() => triggerPageUpdate(`onDidChangeTextEditorSelection`), 200);
      }
    })
  );

  // Automatically run the command
  triggerPageUpdate(`main`);

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
    createFromTemplate,
    createTemplate,
    registerFolder,
    unregisterFolder,
    createContent,
    createByContentType,
    createByTemplate,
    collapseAll,
    createFolder,
    fmStatusBarItem
  );

  console.log(`𝖥𝗋𝗈𝗇𝗍 𝖬𝖺𝗍𝗍𝖾𝗋 𝖢𝖬𝖲 𝖺𝖼𝗍𝗂𝗏𝖺𝗍𝖾𝖽! 𝖱𝖾𝖺𝖽𝗒 𝗍𝗈 𝗌𝗍𝖺𝗋𝗍 𝗐𝗋𝗂𝗍𝗂𝗇𝗀... 👩‍💻🧑‍💻👨‍💻`);
}

export function deactivate() {}

const handleAutoDateUpdate = (e: vscode.TextDocumentWillSaveEvent) => {
  Article.autoUpdate(e);
};

const triggerPageUpdate = (location: string) => {
  Logger.verbose(`Trigger page update: ${location}`);
  pageUpdateDebouncer(() => {
    StatusListener.verify(collection);
  }, 1000);

  if (location === 'onDidChangeActiveTextEditor') {
    PanelProvider.getInstance()?.updateCurrentFile();
  }
};
