import { EditorHelper } from "@estruyf/vscode";
import { Position, window } from "vscode";
import { Dashboard } from "../../commands/Dashboard";
import { DashboardMessage } from "../../dashboardWebView/DashboardMessage";
import { BaseListener } from "./BaseListener";


export class SnippetListener extends BaseListener {

  public static process(msg: { command: DashboardMessage, data: any }) {
    super.process(msg);

    switch(msg.command) {
      case DashboardMessage.insertSnippet:
        this.insertSnippet(msg.data);
        break;
    }
  }

  private static async insertSnippet(data: any) {
    const { file, snippet } = data;

    if (!file || !snippet) {
      return;
    }

    await EditorHelper.showFile(data.file);
    Dashboard.resetViewData();

    const editor = window.activeTextEditor;
    const position = editor?.selection?.active;
    if (!position) {
      return;
    }

    const selection = editor?.selection;
    await editor?.edit(builder => {
      if (selection !== undefined) {
        builder.replace(selection, snippet);
      } else {
        builder.insert(position, snippet);
      }            
    });
  }
}