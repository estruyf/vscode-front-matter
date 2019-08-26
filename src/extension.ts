import * as vscode from 'vscode';
import { FrontMatter } from './commands';
import { TaxonomyType } from './models';

export function activate(context: vscode.ExtensionContext) {

	let insertTags = vscode.commands.registerCommand('frontMatter.insertTags', () => {
		FrontMatter.insert(TaxonomyType.Tag);
	});

	let insertCategories = vscode.commands.registerCommand('frontMatter.insertCategories', () => {
		FrontMatter.insert(TaxonomyType.Category);
	});

	let createTag = vscode.commands.registerCommand('frontMatter.createTag', () => {
		FrontMatter.create(TaxonomyType.Tag);
	});

	let createCategory = vscode.commands.registerCommand('frontMatter.createCategory', () => {
		FrontMatter.create(TaxonomyType.Category);
	});

	let exportTaxonomy = vscode.commands.registerCommand('frontMatter.exportTaxonomy', () => {
		FrontMatter.export();
	});
	
	let setDate = vscode.commands.registerCommand('frontMatter.setDate', () => {
		FrontMatter.setDate();
	});

	context.subscriptions.push(insertTags);
	context.subscriptions.push(insertCategories);
	context.subscriptions.push(createTag);
	context.subscriptions.push(createCategory);
	context.subscriptions.push(exportTaxonomy);
	context.subscriptions.push(setDate);
}

export function deactivate() {}
