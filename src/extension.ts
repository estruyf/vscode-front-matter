import * as vscode from 'vscode';
import { Article, Settings, StatusListener } from './commands';
import { TaxonomyType } from './models';

let frontMatterStatusBar: vscode.StatusBarItem;
let debouncer: { (fnc: any, time: number): void; };
let collection: vscode.DiagnosticCollection;

export function activate({ subscriptions }: vscode.ExtensionContext) {
	collection = vscode.languages.createDiagnosticCollection('frontMatter');

	let insertTags = vscode.commands.registerCommand('frontMatter.insertTags', () => {
		Article.insert(TaxonomyType.Tag);
	});

	let insertCategories = vscode.commands.registerCommand('frontMatter.insertCategories', () => {
		Article.insert(TaxonomyType.Category);
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

	let generateSlug = vscode.commands.registerCommand('frontMatter.generateSlug', () => {
		Article.generateSlug();
	});

	const toggleDraftCommand = 'frontMatter.toggleDraft';
	const toggleDraft = vscode.commands.registerCommand(toggleDraftCommand, async () => {
		await Article.toggleDraft();
		triggerShowDraftStatus();
	});

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
	subscriptions.push(insertCategories);
	subscriptions.push(createTag);
	subscriptions.push(createCategory);
	subscriptions.push(exportTaxonomy);
	subscriptions.push(remap);
	subscriptions.push(setDate);
	subscriptions.push(generateSlug);
	subscriptions.push(toggleDraft);
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
    timeout = setTimeout(functionCall, time);
  };
};