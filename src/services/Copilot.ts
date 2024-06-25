import { extensions } from "vscode";

export class Copilot {
  public static async isInstalled(): Promise<boolean> {
    const copilotExt = extensions.getExtension(`GitHub.copilot`);
    return !!copilotExt;
  }
}