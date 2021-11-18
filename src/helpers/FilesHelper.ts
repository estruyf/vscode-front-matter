import { Notifications } from './Notifications';
import { Uri, workspace } from 'vscode';

export class FilesHelper {

  /**
   * Retrieve all markdown files from the current project
   */
  public static async getMdFiles(): Promise<Uri[] | null> {
    const mdFiles = await workspace.findFiles('**/*.md', "**/node_modules/**,**/archetypes/**");
    const markdownFiles = await workspace.findFiles('**/*.markdown', "**/node_modules/**,**/archetypes/**");
    const mdxFiles = await workspace.findFiles('**/*.mdx', "**/node_modules/**,**/archetypes/**");
    if (!mdFiles && !markdownFiles) {
      Notifications.info(`No MD files found.`);
      return null;
    }

    const allMdFiles = [...mdFiles, ...markdownFiles, ...mdxFiles];
    return allMdFiles;
  }
}