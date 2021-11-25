import { Folders } from "./Folders";
import { ViewColumn, workspace } from "vscode";
import ContentProvider from "../providers/ContentProvider";
import { join } from "path";
import { ContentFolder } from "../models";


export class Diagnostics {

  public static async show() {
    const folders = Folders.get();
    const projectName = Folders.getProjectFolderName();
    const wsFolder = Folders.getWorkspaceFolder();

    const folderData = [];
    for (const folder of folders) {
      folderData.push(await Diagnostics.processFolder(folder, projectName));
    }

    const logging = `# Project name

${projectName}

# Folders

${folders.map(f => `- ${f.title}: "${f.path}"`).join("\n")}

# Workspace folder

${wsFolder ? wsFolder.fsPath : "No workspace folder"}

# Folders to search files

${folderData.join("\n")}
    `;

    ContentProvider.show(logging, `${projectName} diagnostics`, "markdown", ViewColumn.One);
  }

  private static async processFolder(folder: ContentFolder, projectName: string) {
    let projectStart = folder.path.split(projectName).pop();
    projectStart = projectStart || "";
    projectStart = projectStart?.replace(/\\/g, '/');
    projectStart = projectStart?.startsWith('/') ? projectStart.substr(1) : projectStart;

    const mdFiles = await workspace.findFiles(join(projectStart, folder.excludeSubdir ? '/' : '**/', '*.md'));
    const mdxFiles = await workspace.findFiles(join(projectStart, folder.excludeSubdir ? '/' : '**/', '*.mdx'));

    return `- Project start length: ${projectStart.length} | Search in: "${join(projectStart, folder.excludeSubdir ? '/' : '**/', '*.*')}" | mdFiles: ${mdFiles.length} | mdxFiles: ${mdxFiles.length}`;
  }
}