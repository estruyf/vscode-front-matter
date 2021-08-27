import { Memento, extensions } from "vscode";
import { EXTENSION_ID, EXTENSION_STATE_VERSION } from "../constants/Extension";


export class Extension {
  private static instance: Extension;
  
  private constructor(private globalState: Memento, private extPath: string) {}

  /**
   * Creates the singleton instance for the panel
   * @param extPath 
   */
  public static getInstance(globalState?: Memento, extPath?: string): Extension {
    if (!Extension.instance && globalState && extPath) {
      Extension.instance = new Extension(globalState, extPath);
    }

    return Extension.instance;
  }

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

  public setVersion(installedVersion: string): void {
    this.globalState.update(EXTENSION_STATE_VERSION, installedVersion);
  }

  public get extensionPath(): string {
    return this.extPath;
  }
}