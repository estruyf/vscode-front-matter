import * as vscode from 'vscode';
import { EXTENSION_NAME } from '../constants';

export class FilesHelper {

  /**
   * Retrieve all markdown files from the current project
   */
  public static async getMdFiles(): Promise<vscode.Uri[] | null> {
    const mdFiles = await vscode.workspace.findFiles('**/*.md', "**/node_modules/**,**/archetypes/**");
    const markdownFiles = await vscode.workspace.findFiles('**/*.markdown', "**/node_modules/**,**/archetypes/**");
    if (!mdFiles && !markdownFiles) {
      vscode.window.showInformationMessage(`${EXTENSION_NAME}: No MD files found.`);
      return null;
    }

    const allMdFiles = mdFiles.concat(markdownFiles);
    return allMdFiles;
  }
}