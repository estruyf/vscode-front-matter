import { Memento, extensions, Uri } from "vscode";
import { EXTENSION_ID, EXTENSION_STATE_VERSION } from "../constants/Extension";


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
}