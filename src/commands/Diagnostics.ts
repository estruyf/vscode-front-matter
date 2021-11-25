import { Folders } from "./Folders";
import { window } from "vscode";
import ContentProvider from "../providers/ContentProvider";
import { join } from "path";


export class Diagnostics {

  public static show() {
    const folders = Folders.get();
    const projectName = Folders.getProjectFolderName();
    const wsFolder = Folders.getWorkspaceFolder();

    const logging = `# Project name

${projectName}

# Folders

${folders.map(f => `- ${f.title}: "${f.path}"`).join("\n")}

# Workspace folder

${wsFolder ? wsFolder.fsPath : "No workspace folder"}

# Folders to search files

${folders.map(folder => {
  let projectStart = folder.path.split(projectName).pop();
  projectStart = projectStart?.replace(/\\/g, '/');
  projectStart = projectStart?.startsWith('/') ? projectStart.substr(1) : projectStart;
  return `- ${join(projectStart || "", folder.excludeSubdir ? '/' : '**/', '*.md')}`;
}).join("\n")}
    `;

    ContentProvider.show(logging, `${projectName} diagnostics`, "markdown");
  }
}