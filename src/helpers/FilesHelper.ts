import * as os from 'os';
import { Notifications } from './Notifications';
import { DateHelper } from './DateHelper';
import { exec } from 'child_process';
import { Uri, workspace, env as vscodeEnv } from 'vscode';
import { parseWinPath } from './parseWinPath';
import { join } from 'path';

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

  /**
   * Retrieve the metadata from all the files in the folder
   */
  public static async getMetadata(path: string): Promise<{ date: Date, fileName: string }[] | null> {
    return new Promise((resolve) => {
      let command: string = "";

      // Run bash scripts to retrieve metadata faster
      if (os.type() === "Darwin") {
        command = `cd ${path}
for file in *; do 
  fdate=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$file")
  echo "$file,$fdate"
done`;
      } else if (os.type() === "Windows_NT") {
        command = `powershell.exe -Command "Get-Item '${parseWinPath(join(path, "/*"))}' | ForEach-Object { Write-Host $_.name','($_.lastwritetime | Get-Date -Format G); }"`;
      } else if (os.type() === "Linux" && vscodeEnv.remoteName?.toLowerCase() === "wsl") {
        command = `cd ${path}
for file in *; do 
  fdate=$(stat -c "%y" "$file")
  echo "$file,$fdate"
done`;
      } else {
        resolve(null);
        return;
      }
      
      exec(`${command}`, (error, stdout, stderr) => {
        if (error) {
          resolve(null);
          return;
        }

        const lines = stdout.replace(/\r/g, '').split('\n').filter(l => l);
        const metadata: any[] = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const parts = line.split(',');

          metadata.push({
            fileName: parts[0].replace(/(^"|"$)/g, '').trim(), // Remove quotes at the beginning and end
            date: DateHelper.tryParse(parts.slice(1).join(', ').trim(), "MM/d/yyyy h:mm:ss a")
          });
        }

        resolve(metadata);
      });
    });
  }
}