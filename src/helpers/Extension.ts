import { basename } from "path";
import { extensions, Uri, ExtensionContext } from "vscode";
import { Folders, WORKSPACE_PLACEHOLDER } from "../commands/Folders";
import { SETTINGS_CONTENT_FOLDERS, SETTINGS_CONTENT_PAGE_FOLDERS } from "../constants";
import { EXTENSION_BETA_ID, EXTENSION_ID, EXTENSION_STATE_VERSION } from "../constants/Extension";
import { Notifications } from "./Notifications";
import { SettingsHelper } from "./SettingsHelper";


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
    const installedVersion = frontMatter.packageJSON.version;
    const usedVersion = this.ctx.globalState.get<string>(EXTENSION_STATE_VERSION);

    if (!usedVersion) {
      this.setVersion(installedVersion);
    };

    return {
      usedVersion,
      installedVersion
    };
  }

  /**
   * Set the current version information for the extension
   */
  public setVersion(installedVersion: string): void {
    this.ctx.globalState.update(EXTENSION_STATE_VERSION, installedVersion);
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
    const config = SettingsHelper.getConfig();
    const folders = config.get<any>(SETTINGS_CONTENT_FOLDERS);
    if (folders && folders.length > 0) {
      const workspace = Folders.getWorkspaceFolder();
      const projectFolder = basename(workspace?.fsPath || "");

      const paths = folders.map((folder: any) => ({
        title: folder.title,
        path: `${WORKSPACE_PLACEHOLDER}${folder.fsPath.split(projectFolder).slice(1).join('')}`
      }));

      await config.update(`${SETTINGS_CONTENT_PAGE_FOLDERS}`, paths);
    }
  }

  public async setState(propKey: string, propValue: string): Promise<void> {
    await this.ctx.globalState.update(propKey, propValue);
  }

  public async getState<T>(propKey: string): Promise<T | undefined> {
    return await this.ctx.globalState.get(propKey);
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
}