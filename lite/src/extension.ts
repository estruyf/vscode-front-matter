import * as vscode from 'vscode';
import { DashboardProvider } from './DashboardProvider';
import { PanelProvider } from './PanelProvider';
import { isVirtualWorkspace } from './utils';

/**
 * Lite version of Front Matter CMS for virtual workspaces
 * This version provides basic content management functionality using
 * the VS Code FileSystem API which works in virtual workspaces like github.dev
 */

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('Front Matter Lite');
  outputChannel.appendLine('Front Matter Lite activated for virtual workspace');

  // Register Panel Webview Provider
  const panelProvider = new PanelProvider(context.extensionUri, outputChannel);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      PanelProvider.viewType,
      panelProvider
    )
  );

  // Register Dashboard Webview Provider
  const dashboardProvider = new DashboardProvider(context.extensionUri, outputChannel);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      DashboardProvider.viewType,
      dashboardProvider
    )
  );

  // Register Dashboard command
  context.subscriptions.push(
    vscode.commands.registerCommand('frontMatter.lite.dashboard', async () => {
      // Focus on the dashboard view
      vscode.commands.executeCommand('frontMatterLite.dashboard.focus');
    })
  );

  // Register folder registration command
  context.subscriptions.push(
    vscode.commands.registerCommand('frontMatter.lite.registerFolder', async (uri: vscode.Uri) => {
      try {
        const config = vscode.workspace.getConfiguration('frontMatter');
        const pageFolders = config.get<Array<{ title: string; path: string }>>('content.pageFolders') || [];
        
        // Get workspace folder
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        if (!workspaceFolder) {
          vscode.window.showErrorMessage('No workspace folder found');
          return;
        }

        // Calculate relative path
        const relativePath = vscode.workspace.asRelativePath(uri, false);
        
        // Check if folder is already registered
        const exists = pageFolders.some(f => f.path === relativePath);
        if (exists) {
          vscode.window.showInformationMessage(`Folder "${relativePath}" is already registered`);
          return;
        }

        // Prompt for folder title
        const title = await vscode.window.showInputBox({
          prompt: 'Enter a title for this content folder',
          value: relativePath
        });

        if (!title) {
          return;
        }

        // Add folder to configuration
        pageFolders.push({
          title,
          path: relativePath
        });

        await config.update('content.pageFolders', pageFolders, vscode.ConfigurationTarget.Workspace);
        
        vscode.window.showInformationMessage(
          `Content folder "${title}" registered successfully!`,
          'View Configuration'
        ).then(selection => {
          if (selection === 'View Configuration') {
            vscode.commands.executeCommand('workbench.action.openSettings', 'frontMatter.content.pageFolders');
          }
        });

        outputChannel.appendLine(`Registered content folder: ${title} (${relativePath})`);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to register folder: ${error}`);
        outputChannel.appendLine(`Error registering folder: ${error}`);
      }
    })
  );

  // Register create content command
  context.subscriptions.push(
    vscode.commands.registerCommand('frontMatter.lite.createContent', async () => {
      try {
        const config = vscode.workspace.getConfiguration('frontMatter');
        const pageFolders = config.get<Array<{ title: string; path: string }>>('content.pageFolders') || [];

        if (pageFolders.length === 0) {
          const action = await vscode.window.showWarningMessage(
            'No content folders configured. Please register a content folder first.',
            'Register Folder'
          );
          
          if (action === 'Register Folder') {
            vscode.window.showInformationMessage(
              'Please right-click on a folder in the Explorer and select "Front Matter Lite > Register Content Folder"'
            );
          }
          return;
        }

        // Select a content folder
        const selectedFolder = await vscode.window.showQuickPick(
          pageFolders.map(f => ({ label: f.title, description: f.path, folder: f })),
          { placeHolder: 'Select a content folder' }
        );

        if (!selectedFolder) {
          return;
        }

        // Prompt for file name
        const fileName = await vscode.window.showInputBox({
          prompt: 'Enter the file name (without extension)',
          validateInput: (value) => {
            if (!value) {
              return 'File name is required';
            }
            if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
              return 'File name can only contain letters, numbers, hyphens, and underscores';
            }
            return null;
          }
        });

        if (!fileName) {
          return;
        }

        // Create the file
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
          vscode.window.showErrorMessage('No workspace folder found');
          return;
        }

        const folderUri = vscode.Uri.joinPath(
          workspaceFolders[0].uri,
          selectedFolder.folder.path
        );
        
        const fileUri = vscode.Uri.joinPath(folderUri, `${fileName}.md`);
        
        // Check if file already exists
        try {
          await vscode.workspace.fs.stat(fileUri);
          vscode.window.showErrorMessage(`File "${fileName}.md" already exists`);
          return;
        } catch (error) {
          // Only proceed if the error is FileNotFound
          if (error instanceof vscode.FileSystemError && error.code !== 'FileNotFound') {
            vscode.window.showErrorMessage(`Error checking file: ${error.message}`);
            outputChannel.appendLine(`Error checking file: ${error}`);
            return;
          }
          // File doesn't exist, continue
        }

        // Create basic front matter content
        const date = new Date().toISOString();
        const content = `---
title: ${fileName}
description: 
date: ${date}
tags: []
---

# ${fileName}

Your content here...
`;

        const encoder = new TextEncoder();
        await vscode.workspace.fs.writeFile(fileUri, encoder.encode(content));

        // Open the file
        const doc = await vscode.workspace.openTextDocument(fileUri);
        await vscode.window.showTextDocument(doc);

        vscode.window.showInformationMessage(`Content "${fileName}.md" created successfully!`);
        outputChannel.appendLine(`Created content: ${fileUri.fsPath}`);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to create content: ${error}`);
        outputChannel.appendLine(`Error creating content: ${error}`);
      }
    })
  );

  // Check if running in virtual workspace
  if (isVirtualWorkspace()) {
    outputChannel.appendLine('Running in virtual workspace mode');
    vscode.window.showInformationMessage(
      'Front Matter Lite is running in virtual workspace mode. Some features may be limited.',
      'Learn More'
    ).then(selection => {
      if (selection === 'Learn More') {
        vscode.env.openExternal(
          vscode.Uri.parse('https://frontmatter.codes/docs/virtual-workspaces')
        );
      }
    });
  }

  outputChannel.appendLine('Front Matter Lite: All commands registered');
}

export function deactivate() {
  if (outputChannel) {
    outputChannel.dispose();
  }
}
