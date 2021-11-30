import { ContentType } from './helpers/ContentType';
import { Dashboard } from './commands/Dashboard';
import * as vscode from 'vscode';
import { Article, Settings, StatusListener } from './commands';
import { Folders } from './commands/Folders';
import { Preview } from './commands/Preview';
import { Project } from './commands/Project';
import { Template } from './commands/Template';
import { COMMAND_NAME } from './constants';
import { TaxonomyType } from './models';
import { MarkdownFoldingProvider } from './providers/MarkdownFoldingProvider';
import { TagType } from './panelWebView/TagType';
import { ExplorerView } from './explorerView/ExplorerView';
import { Extension } from './helpers/Extension';
import { DashboardData } from './models/DashboardData';
import { Settings as SettingsHelper } from './helpers';
import { Content } from './commands/Content';
import ContentProvider from './providers/ContentProvider';
import { Wysiwyg } from './commands/Wysiwyg';
import { Diagnostics } from './commands/Diagnostics';

let frontMatterStatusBar: vscode.StatusBarItem;
let statusDebouncer: { (fnc: any, time: number): void; };
let editDebounce: { (fnc: any, time: number): void; };
let collection: vscode.DiagnosticCollection;

const mdSelector: vscode.DocumentSelector = { language: 'markdown', scheme: 'file' };

export async function activate(context: vscode.ExtensionContext) {
	const { subscriptions, extensionUri, extensionPath } = context;

	const extension = Extension.getInstance(context);

	if (!extension.checkIfExtensionCanRun()) {
		return undefined;
	}
	
	SettingsHelper.init();
	extension.migrateSettings();
	
	SettingsHelper.checkToPromote();

	collection = vscode.languages.createDiagnosticCollection('frontMatter');

	// Pages dashboard
	Dashboard.init();
	subscriptions.push(vscode.commands.registerCommand(COMMAND_NAME.dashboard, (data?: DashboardData) => {
		Dashboard.open(data);
	}));
	
	subscriptions.push(vscode.commands.registerCommand(COMMAND_NAME.dashboardClose, (data?: DashboardData) => {
		Dashboard.close();
	}));

	if (!extension.getVersion().usedVersion) {
		vscode.commands.executeCommand(COMMAND_NAME.dashboard);
	}

	// Register the explorer view
	const explorerSidebar = ExplorerView.getInstance(extensionUri);
	const explorerView = vscode.window.registerWebviewViewProvider(ExplorerView.viewType, explorerSidebar, {
		webviewOptions: {
			retainContextWhenHidden: true
		}
	});

	// Folding the front matter of markdown files
	vscode.languages.registerFoldingRangeProvider(mdSelector, new MarkdownFoldingProvider());

	const insertTags = vscode.commands.registerCommand(COMMAND_NAME.insertTags, async () => {
		await vscode.commands.executeCommand('workbench.view.extension.frontmatter-explorer');
		await vscode.commands.executeCommand('workbench.action.focusSideBar');
		explorerSidebar.triggerInputFocus(TagType.tags);
	});

	const insertCategories = vscode.commands.registerCommand(COMMAND_NAME.insertCategories, async () => {
		await vscode.commands.executeCommand('workbench.view.extension.frontmatter-explorer');
		await vscode.commands.executeCommand('workbench.action.focusSideBar');
		explorerSidebar.triggerInputFocus(TagType.categories);
	});

	const createTag = vscode.commands.registerCommand(COMMAND_NAME.createTag, () => {
		Settings.create(TaxonomyType.Tag);
	});

	const createCategory = vscode.commands.registerCommand(COMMAND_NAME.createCategory, () => {
		Settings.create(TaxonomyType.Category);
	});

	const exportTaxonomy = vscode.commands.registerCommand(COMMAND_NAME.exportTaxonomy, Settings.export);

	const remap = vscode.commands.registerCommand(COMMAND_NAME.remap, Settings.remap);

	const setLastModifiedDate = vscode.commands.registerCommand(COMMAND_NAME.setLastModifiedDate, Article.setLastModifiedDate);

	const generateSlug = vscode.commands.registerCommand(COMMAND_NAME.generateSlug, Article.generateSlug);

	const createFromTemplate = vscode.commands.registerCommand(COMMAND_NAME.createFromTemplate, (folder: vscode.Uri) => {
		const folderPath = Folders.getFolderPath(folder);
    if (folderPath) {
      Template.create(folderPath);
    }
	}); 

	let createTemplate = vscode.commands.registerCommand(COMMAND_NAME.createTemplate, Template.generate);

	const toggleDraftCommand = COMMAND_NAME.toggleDraft;
	const toggleDraft = vscode.commands.registerCommand(toggleDraftCommand, async () => {
		await Article.toggleDraft();
		triggerShowDraftStatus();
	});

	// Register project folders
	const registerFolder = vscode.commands.registerCommand(COMMAND_NAME.registerFolder, Folders.register);

	const unregisterFolder = vscode.commands.registerCommand(COMMAND_NAME.unregisterFolder, Folders.unregister);

	const createFolder = vscode.commands.registerCommand(COMMAND_NAME.createFolder, Folders.addMediaFolder);

	const createByContentType = vscode.commands.registerCommand(COMMAND_NAME.createByContentType, ContentType.createContent);
	const createByTemplate = vscode.commands.registerCommand(COMMAND_NAME.createByTemplate, Folders.create);
	const createContent = vscode.commands.registerCommand(COMMAND_NAME.createContent, Content.create);

	// Initialize command
	Template.init();
	const projectInit = vscode.commands.registerCommand(COMMAND_NAME.init, async (cb: Function) => {
		await Project.init();

		if (cb) {
			cb();
		}
	});

	// Settings promotion command
	subscriptions.push(vscode.commands.registerCommand(COMMAND_NAME.promote, SettingsHelper.promote ));

	// Collapse all sections in the webview
	const collapseAll = vscode.commands.registerCommand(COMMAND_NAME.collapseSections, () => {
		ExplorerView.getInstance()?.collapseAll();
	});

	// Things to do when configuration changes
	SettingsHelper.onConfigChange((global?: any) => {
		Template.init();
		Preview.init();

		const exView = ExplorerView.getInstance();
		exView.getSettings();
		exView.getFoldersAndFiles();	
		MarkdownFoldingProvider.triggerHighlighting();
	});

	// Create the status bar
 	frontMatterStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	frontMatterStatusBar.command = toggleDraftCommand;
	subscriptions.push(frontMatterStatusBar);
	statusDebouncer = debounceCallback();
	
	// Register listeners that make sure the status bar updates
	subscriptions.push(vscode.window.onDidChangeActiveTextEditor(triggerShowDraftStatus));
	subscriptions.push(vscode.window.onDidChangeTextEditorSelection(triggerShowDraftStatus));
	
	// Automatically run the command
	triggerShowDraftStatus();

	// Listener for file edit changes
	editDebounce = debounceCallback();
	subscriptions.push(vscode.workspace.onDidChangeTextDocument(triggerFileChange));

	// Listener for file saves
	subscriptions.push(vscode.workspace.onDidSaveTextDocument((doc: vscode.TextDocument) => {
		if (doc.languageId === 'markdown') {
			// Optimize the list of recently changed files
			ExplorerView.getInstance().getFoldersAndFiles();
		}
	}));

	// Webview for preview
	Preview.init();
	subscriptions.push(vscode.commands.registerCommand(COMMAND_NAME.preview, () => Preview.open(extensionPath) ));

	// Inserting an image in Markdown
	subscriptions.push(vscode.commands.registerCommand(COMMAND_NAME.insertImage, Article.insertImage));

	// Create the editor experience for bulk scripts
	subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(ContentProvider.scheme, new ContentProvider()));

	// What you see, is what you get
	Wysiwyg.registerCommands(subscriptions);
	
	// Diagnostics
	subscriptions.push(vscode.commands.registerCommand(COMMAND_NAME.diagnostics, Diagnostics.show));

	// Subscribe all commands
	subscriptions.push(
		insertTags,
		explorerView,
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
		projectInit,
		collapseAll,
		createFolder
	);
}

export function deactivate() {}

const triggerFileChange = (e: vscode.TextDocumentChangeEvent) => {
	editDebounce(() => Article.autoUpdate(e), 1000);
};

const triggerShowDraftStatus = () => {
	statusDebouncer(() => { StatusListener.verify(frontMatterStatusBar, collection); }, 1000);
};

const debounceCallback = () => {
  let timeout: NodeJS.Timeout;

  return (fnc: any, time: number) => {
    const functionCall = (...args: any[]) => fnc.apply(args);
    clearTimeout(timeout);
    timeout = setTimeout(functionCall, time) as any;
  };
};