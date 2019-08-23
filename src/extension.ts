import * as vscode from 'vscode';
import { Hugo } from './commands';
import { TaxonomyType } from './models';

export function activate(context: vscode.ExtensionContext) {

	let insertTags = vscode.commands.registerCommand('hugo.insertTags', () => {
		Hugo.insert(TaxonomyType.Tag);
	});

	let insertCategories = vscode.commands.registerCommand('hugo.insertCategories', () => {
		Hugo.insert(TaxonomyType.Category);
	});

	let createTag = vscode.commands.registerCommand('hugo.createTag', () => {
		Hugo.create(TaxonomyType.Tag);
	});

	let createCategory = vscode.commands.registerCommand('hugo.createCategory', () => {
		Hugo.create(TaxonomyType.Category);
	});

	context.subscriptions.push(insertTags);
	context.subscriptions.push(insertCategories);
	context.subscriptions.push(createTag);
	context.subscriptions.push(createCategory);
}

export function deactivate() {}
