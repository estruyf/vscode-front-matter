import { existsSync, renameSync } from "fs";
import { basename, join } from "path";
import { extensions, Uri, ExtensionContext, window, workspace, commands } from "vscode";
import { Folders, WORKSPACE_PLACEHOLDER } from "../commands/Folders";
import { EXTENSION_NAME, GITHUB_LINK, SETTINGS_CONTENT_FOLDERS, SETTINGS_CONTENT_PAGE_FOLDERS, SETTING_DATE_FIELD, SETTING_MODIFIED_FIELD, SETTING_SEO_DESCRIPTION_FIELD, SETTING_TAXONOMY_CONTENT_TYPES, DEFAULT_CONTENT_TYPE_NAME, EXTENSION_BETA_ID, EXTENSION_ID, ExtensionState, DefaultFields, LocalStore, SETTING_TEMPLATES_FOLDER } from "../constants";
import { ContentType } from "../models";
import { Notifications } from "./Notifications";
import { parseWinPath } from "./parseWinPath";
import { Settings } from "./SettingsHelper";


export class Extension {
  private static instance: Extension;
  
  private constructor(private ctx: ExtensionContext) {}

  /**
   * Creates the singleton instance for the panel
   * @param extPath 
   */
  public static getInstance(ctx?: ExtensionContext): Extension {
    if (!Extension.instance && ctx) {
      Extension.instance = new Extension(ctx);
    }

    return Extension.instance;
  }

  /**
   * Get the current version information for the extension
   */
  public getVersion(): { usedVersion: string | undefined, installedVersion: string } {
    const frontMatter = extensions.getExtension(this.isBetaVersion() ? EXTENSION_BETA_ID : EXTENSION_ID)!;
    let installedVersion = frontMatter.packageJSON.version;
    const usedVersion = this.ctx.globalState.get<string>(ExtensionState.Version);
    
    if (this.isBetaVersion()) {
      installedVersion = `${installedVersion}-beta`;
    }

    if (usedVersion !== installedVersion) {
      const whatIsNewTitle = `Check the changelog`;
      const githubTitle = `Give it a ⭐️`;

      const whatIsNew = {
        title: whatIsNewTitle,
        run: () => {
          const uri = Uri.file(`${Extension.getInstance().extensionPath.fsPath}/CHANGELOG.md`);
          workspace.openTextDocument(uri).then((() => {
            commands.executeCommand("markdown.showPreview", uri)
          }));
        }
      };

      const starGitHub = {
        title: githubTitle,
        run: () => {
          commands.executeCommand('vscode.open', Uri.parse(GITHUB_LINK));
        }
      };

      window.showInformationMessage(`${EXTENSION_NAME} has been updated to v${installedVersion} — check out what's new!`, starGitHub, whatIsNew).then((selection => {
        if (selection?.title === whatIsNewTitle || selection?.title === githubTitle) {
          selection.run();
        }
      }));

      this.setVersion(installedVersion);
    }

    return {
      usedVersion,
      installedVersion
    };
  }

  /**
   * Set the current version information for the extension
   */
  public setVersion(installedVersion: string): void {
    this.ctx.globalState.update(ExtensionState.Version, installedVersion);
  }

  /**
   * Get the path to the extension
   */
  public get extensionPath(): Uri {
    return this.ctx.extensionUri;
  }

  /**
   * Migrate old settings to new settings
   */
  public async migrateSettings(): Promise<void> {
    const versionInfo = this.getVersion();
    if (versionInfo.usedVersion === undefined) {
      return;
    }

    if (!versionInfo.usedVersion) {
      return;
    }

    // Split semantic version
    const version = versionInfo.usedVersion.split('.');
    const major = parseInt(version[0]);
    const minor = parseInt(version[1]);
    const patch = parseInt(version[2]);

    // Migration to version 3.1.0
    if (major < 3 || (major === 3 && minor < 1)) {
      const folders = Settings.get<any>(SETTINGS_CONTENT_FOLDERS);
      if (folders && folders.length > 0) {
        const workspace = Folders.getWorkspaceFolder();
        const projectFolder = basename(workspace?.fsPath || "");

        const paths = folders.map((folder: any) => ({
          ...folder,
          path: `${WORKSPACE_PLACEHOLDER}${folder.fsPath.split(projectFolder).slice(1).join('')}`.split('\\').join('/')
        }));

        await Settings.update(SETTINGS_CONTENT_PAGE_FOLDERS, paths);
      }
    }

    // Create team settings
    if (Settings.hasSettings()) {
      Settings.createTeamSettings();
    }

    // Migration to version 4.0.0
    if (major < 4) {
      const dateField = Settings.get<string>(SETTING_DATE_FIELD);
      const lastModField = Settings.get<string>(SETTING_MODIFIED_FIELD);
      const description = Settings.get<string>(SETTING_SEO_DESCRIPTION_FIELD);
      const contentTypes = Settings.get<ContentType[]>(SETTING_TAXONOMY_CONTENT_TYPES);

      if (contentTypes) {
        let needsUpdate = false;
        let defaultContentType = contentTypes.find(ct => ct.name === DEFAULT_CONTENT_TYPE_NAME);

        // Check if fields need to be changed for the default content type
        if (defaultContentType) {
          if (dateField && dateField !== DefaultFields.PublishingDate) {
            const newDateField = defaultContentType.fields.find(f => f.name === dateField);

            if (!newDateField) {
              defaultContentType.fields = defaultContentType.fields.filter(f => f.name !== DefaultFields.PublishingDate);
              defaultContentType.fields.push({
                title: dateField,
                name: dateField,
                type: "datetime"
              });
              needsUpdate = true;
            }
          }
    
          if (lastModField && lastModField !== DefaultFields.LastModified) {
            const newModField = defaultContentType.fields.find(f => f.name === lastModField);

            if (!newModField) {
              defaultContentType.fields = defaultContentType.fields.filter(f => f.name !== DefaultFields.LastModified);
              defaultContentType.fields.push({
                title: lastModField,
                name: lastModField,
                type: "datetime"
              });
              needsUpdate = true;
            }
          }
    
          if (description && description !== DefaultFields.Description) {
            const newDescField = defaultContentType.fields.find(f => f.name === description);

            if (!newDescField) {
              defaultContentType.fields = defaultContentType.fields.filter(f => f.name !== DefaultFields.Description);
              defaultContentType.fields.push({
                title: description,
                name: description,
                type: "string"
              });
              needsUpdate = true;
            }
          }
    
          if (needsUpdate) {
            await Settings.update(SETTING_TAXONOMY_CONTENT_TYPES, contentTypes, true);
          }
        }
      }
    }

    // Migration to version 5
    if (major <= 5) {
      const isMoved = await Extension.getInstance().getState<boolean | undefined>(ExtensionState.MoveTemplatesFolder);
      if (!isMoved) {
        const wsFolder= Folders.getWorkspaceFolder();
        if (wsFolder) {
          const templateFolder = join(parseWinPath(wsFolder.fsPath), `.templates`);
          if (existsSync(templateFolder)) {
            window.showInformationMessage(`Would you like to move your ".templates" folder to the new ".frontmatter" folder?`, 'Yes', 'No').then(async (result) => {
              if (result === "Yes") {
                const newFolderPath = join(parseWinPath(wsFolder.fsPath), LocalStore.rootFolder, LocalStore.templatesFolder);
                renameSync(templateFolder, newFolderPath);
                commands.executeCommand(`workbench.action.reloadWindow`);
                Settings.update(SETTING_TEMPLATES_FOLDER, undefined, true);
                Settings.update(SETTING_TEMPLATES_FOLDER, undefined);
              } else if (result === "No") {
                Settings.update(SETTING_TEMPLATES_FOLDER, `.templates`, true);
              }
    
              if (result === "No" || result === "Yes") {
                Extension.getInstance().setState(ExtensionState.MoveTemplatesFolder, true);
              }
            });
          }
        }
      }
    }
  }

  public async setState<T>(propKey: string, propValue: T, type: "workspace" | "global" = "global"): Promise<void> {
    if (type === "global") {
      await this.ctx.globalState.update(propKey, propValue);
    } else {
      await this.ctx.workspaceState.update(propKey, propValue);
    }
  }

  public async getState<T>(propKey: string, type: "workspace" | "global" = "global"): Promise<T | undefined> {
    if (type === "global") {
      return await this.ctx.globalState.get(propKey);
    } else {
      return await this.ctx.workspaceState.get(propKey);
    }
  }

  public isBetaVersion() {
    return basename(this.ctx.globalStorageUri.fsPath) === EXTENSION_BETA_ID;
  }

  public checkIfExtensionCanRun() {
    if (this.isBetaVersion()) {
      const mainVersionInstalled = extensions.getExtension(EXTENSION_ID);

      if (mainVersionInstalled) {
        Notifications.error(`Front Matter BETA cannot be used while the main version is installed. Please ensure that you have only over version installed.`);
        return false;
      }
    }

    return true;
  }

  public get packageJson() {
    const frontMatter = extensions.getExtension(this.isBetaVersion() ? EXTENSION_BETA_ID : EXTENSION_ID)!;
    return frontMatter.packageJSON;
  }
}