import { EditorHelper } from "@estruyf/vscode";
import { Position, window } from "vscode";
import { Dashboard } from "../../commands/Dashboard";
import { SETTING_CONTENT_SNIPPETS } from "../../constants";
import { DashboardMessage } from "../../dashboardWebView/DashboardMessage";
import { Notifications, Settings } from "../../helpers";
import { BaseListener } from "./BaseListener";
import { SettingsListener } from "./SettingsListener";


export class SnippetListener extends BaseListener {

  public static process(msg: { command: DashboardMessage, data: any }) {
    super.process(msg);

    switch(msg.command) {
      case DashboardMessage.addSnippet:
        this.addSnippet(msg.data);
        break;
      case DashboardMessage.updateSnippet:
        this.updateSnippet(msg.data);
        break;
      case DashboardMessage.insertSnippet:
        this.insertSnippet(msg.data);
        break;
    }
  }

  private static async addSnippet(data: any) {
    const { title, description, body, fields } = data;

    if (!title || !body) {
      Notifications.warning("Snippet missing title or body");
      return;
    }

    const snippets = Settings.get<any>(SETTING_CONTENT_SNIPPETS);
    if (snippets && snippets[title]) {
      Notifications.warning("Snippet with the same title already exists");
      return;
    }

    const snippetLines = body.split("\n");

    snippets[title] = { 
      description, 
      body: snippetLines.length === 1 ? snippetLines[0] : snippetLines,
      fields: fields || []
    };
    
    await Settings.update(SETTING_CONTENT_SNIPPETS, snippets, true);
    SettingsListener.getSettings();
  }

  private static async updateSnippet(data: any) {
    const { snippets } = data;
    
    if (!snippets) {
      Notifications.warning("No snippets to update");
      return;
    }

    await Settings.update(SETTING_CONTENT_SNIPPETS, snippets, true);
    SettingsListener.getSettings();
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