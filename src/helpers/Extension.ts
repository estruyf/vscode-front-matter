import { basename } from "path";
import { Memento, extensions, Uri } from "vscode";
import { Folders, WORKSPACE_PLACEHOLDER } from "../commands/Folders";
import { SETTINGS_CONTENT_FOLDERS, SETTINGS_CONTENT_PAGE_FOLDERS } from "../constants";
import { EXTENSION_ID, EXTENSION_STATE_VERSION } from "../constants/Extension";
import { SettingsHelper } from "./SettingsHelper";


export class Extension {
  private static instance: Extension;
  
  private constructor(private globalState: Memento, private extPath: Uri) {}

  /**
   * Creates the singleton instance for the panel
   * @param extPath 
   */
  public static getInstance(globalState?: Memento, extPath?: Uri): Extension {
    if (!Extension.instance && globalState && extPath) {
      Extension.instance = new Extension(globalState, extPath);
    }

    return Extension.instance;
  }

  /**
   * Get the current version information for the extension
   */
  public getVersion(): { usedVersion: string | undefined, installedVersion: string } {
    const frontMatter = extensions.getExtension(EXTENSION_ID)!;
    const installedVersion = frontMatter.packageJSON.version;
    const usedVersion = this.globalState.get<string>(EXTENSION_STATE_VERSION);

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
    this.globalState.update(EXTENSION_STATE_VERSION, installedVersion);
  }

  /**
   * Get the path to the extension
   */
  public get extensionPath(): Uri {
    return this.extPath;
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
    await this.globalState.update(propKey, propValue);
  }

  public async getState<T>(propKey: string): Promise<T | undefined> {
    return await this.globalState.get(propKey);
  }
}