import * as vscode from 'vscode';
import { Article, Settings, StatusListener } from './commands';
import { Folders } from './commands/Folders';
import { Template } from './commands/Template';
import { TaxonomyType } from './models';
import { TagType } from './viewpanel/TagType';
import { ExplorerView } from './webview/ExplorerView';

let frontMatterStatusBar: vscode.StatusBarItem;
let debouncer: { (fnc: any, time: number): void; };
let collection: vscode.DiagnosticCollection;

export async function activate({ subscriptions, extensionUri }: vscode.ExtensionContext) {
	collection = vscode.languages.createDiagnosticCollection('frontMatter');

	const explorerSidebar = ExplorerView.getInstance(extensionUri);
	let explorerView = vscode.window.registerWebviewViewProvider(ExplorerView.viewType, explorerSidebar, {
		webviewOptions: {
			retainContextWhenHidden: true
		}
	});

	let insertTags = vscode.commands.registerCommand('frontMatter.insertTags', async () => {
		await vscode.commands.executeCommand('workbench.view.extension.frontmatter-explorer');
		await vscode.commands.executeCommand('workbench.action.focusSideBar');
		explorerSidebar.triggerInputFocus(TagType.tags);
	});

	let insertCategories = vscode.commands.registerCommand('frontMatter.insertCategories', async () => {
		await vscode.commands.executeCommand('workbench.view.extension.frontmatter-explorer');
		await vscode.commands.executeCommand('workbench.action.focusSideBar');
		explorerSidebar.triggerInputFocus(TagType.categories);
	});

	let createTag = vscode.commands.registerCommand('frontMatter.createTag', () => {
		Settings.create(TaxonomyType.Tag);
	});

	let createCategory = vscode.commands.registerCommand('frontMatter.createCategory', () => {
		Settings.create(TaxonomyType.Category);
	});

	let exportTaxonomy = vscode.commands.registerCommand('frontMatter.exportTaxonomy', () => {
		Settings.export();
	});

	let remap = vscode.commands.registerCommand('frontMatter.remap', () => {
		Settings.remap();
	});

	let setDate = vscode.commands.registerCommand('frontMatter.setDate', () => {
		Article.setDate();
	});

	let setLastModifiedDate = vscode.commands.registerCommand('frontMatter.setLastModifiedDate', () => {
		Article.setLastModifiedDate();
	});

	let generateSlug = vscode.commands.registerCommand('frontMatter.generateSlug', () => {
		Article.generateSlug();
	});

	let createFromTemplate = vscode.commands.registerCommand('frontMatter.createFromTemplate', (folder: vscode.Uri) => {
		const folderPath = Folders.getFolderPath(folder);
    if (folderPath) {
      Template.create(folderPath);
    }
	});

	const toggleDraftCommand = 'frontMatter.toggleDraft';
	const toggleDraft = vscode.commands.registerCommand(toggleDraftCommand, async () => {
		await Article.toggleDraft();
		triggerShowDraftStatus();
	});

	// Register project folders
	const registerFolder = vscode.commands.registerCommand(`frontMatter.registerFolder`, Folders.register);

	const unregisterFolder = vscode.commands.registerCommand(`frontMatter.unregisterFolder`, Folders.unregister);

	const createContent = vscode.commands.registerCommand(`frontMatter.createContent`, Folders.create);

	Folders.updateVsCodeCtx();

	// Create the status bar
 	frontMatterStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	frontMatterStatusBar.command = toggleDraftCommand;
	subscriptions.push(frontMatterStatusBar);
	debouncer = debounceShowDraftTrigger();
	// Register listeners that make sure the status bar updates
	subscriptions.push(vscode.window.onDidChangeActiveTextEditor(triggerShowDraftStatus));
	subscriptions.push(vscode.window.onDidChangeTextEditorSelection(triggerShowDraftStatus));
	// Automatically run the command
	triggerShowDraftStatus();

	// Subscribe all commands
	subscriptions.push(insertTags);
	subscriptions.push(explorerView);
	subscriptions.push(insertCategories);
	subscriptions.push(createTag);
	subscriptions.push(createCategory);
	subscriptions.push(exportTaxonomy);
	subscriptions.push(remap);
	subscriptions.push(setDate);
	subscriptions.push(setLastModifiedDate);
	subscriptions.push(generateSlug);
	subscriptions.push(createFromTemplate);
	subscriptions.push(toggleDraft);
	subscriptions.push(registerFolder);
	subscriptions.push(unregisterFolder);
	subscriptions.push(createContent);
}

export function deactivate() {}

const triggerShowDraftStatus = () => {
	debouncer(() => { StatusListener.verify(frontMatterStatusBar, collection); }, 1000);
};

const debounceShowDraftTrigger = () => {
  let timeout: NodeJS.Timeout;

  return (fnc: any, time: number) => {
    const functionCall = (...args: any[]) => fnc.apply(args);
    clearTimeout(timeout);
    timeout = setTimeout(functionCall, time) as any;
  };
};