import * as vscode from 'vscode';

/**
 * Check if the current workspace is a virtual workspace
 * Virtual workspaces use schemes other than 'file' (e.g., 'vscode-vfs', 'github')
 */
export function isVirtualWorkspace(): boolean {
  if (!vscode.workspace.workspaceFolders) {
    return false;
  }
  
  return vscode.workspace.workspaceFolders.some(
    folder => folder.uri.scheme !== 'file'
  );
}
