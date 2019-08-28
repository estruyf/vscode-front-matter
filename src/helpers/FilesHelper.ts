import * as vscode from 'vscode';

export class FilesHelper {

  /**
   * Retrieve all markdown files from the current project
   */
  public static async getMdFiles(): Promise<vscode.Uri[] | null> {
    const mdFiles = await vscode.workspace.findFiles('**/*.md', "**/node_modules/**");
    const markdownFiles = await vscode.workspace.findFiles('**/*.markdown', "**/node_modules/**");
    if (!mdFiles && !markdownFiles) {
      vscode.window.showInformationMessage(`No MD files found.`);
      return null;
    }

    const allMdFiles = mdFiles.concat(markdownFiles);
    return allMdFiles;
  }
}