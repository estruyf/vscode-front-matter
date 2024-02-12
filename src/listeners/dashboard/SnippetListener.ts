import { EditorHelper } from '@estruyf/vscode';
import { window, Range, Position } from 'vscode';
import { Dashboard } from '../../commands/Dashboard';
import { SETTING_CONTENT_SNIPPETS, SETTING_DATE_FORMAT, TelemetryEvent } from '../../constants';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import {
  ArticleHelper,
  Notifications,
  Settings,
  Telemetry,
  processArticlePlaceholdersFromPath,
  processTimePlaceholders
} from '../../helpers';
import { PostMessageData, Snippets } from '../../models';
import { BaseListener } from './BaseListener';
import { SettingsListener } from './SettingsListener';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export class SnippetListener extends BaseListener {
  public static process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case DashboardMessage.addSnippet:
        this.addSnippet(msg.payload);
        break;
      case DashboardMessage.updateSnippet:
        this.updateSnippet(msg.payload);
        break;
      case DashboardMessage.insertSnippet:
        Telemetry.send(TelemetryEvent.insertContentSnippet);
        this.insertSnippet(msg.payload);
        break;
      case DashboardMessage.updateSnippetPlaceholders:
        this.updateSnippetPlaceholders(msg.command, msg.payload, msg.requestId);
        break;
    }
  }

  private static async addSnippet(data: any) {
    const { title, description, body, fields, isMediaSnippet } = data;

    if (!title || !body) {
      Notifications.warning(
        l10n.t(LocalizationKey.listenersDashboardSnippetListenerAddSnippetMissingFieldsWarning)
      );
      return;
    }

    const snippets = Settings.get<any>(SETTING_CONTENT_SNIPPETS);
    if (snippets && snippets[title]) {
      Notifications.warning(
        l10n.t(LocalizationKey.listenersDashboardSnippetListenerAddSnippetExistsWarning)
      );
      return;
    }

    const snippetLines = body.split('\n');

    const snippetContent: any = {
      description,
      body: snippetLines.length === 1 ? snippetLines[0] : snippetLines
    };

    if (isMediaSnippet) {
      snippetContent.isMediaSnippet = true;
    } else {
      snippetContent.fields = fields || [];
    }

    snippets[title] = snippetContent;

    await Settings.update(SETTING_CONTENT_SNIPPETS, snippets, true);
    SettingsListener.getSettings(true);
  }

  private static async updateSnippet(data: any) {
    const { snippets } = data;

    if (!snippets) {
      Notifications.warning(
        l10n.t(LocalizationKey.listenersDashboardSnippetListenerUpdateSnippetNoSnippetsWarning)
      );
      return;
    }

    // Filter out external data snippets
    const snippetsToStore = Object.keys(snippets).reduce((acc, key) => {
      if (!snippets[key].sourcePath) {
        acc[key] = snippets[key];
      }
      return acc;
    }, {} as Snippets);

    await Settings.update(SETTING_CONTENT_SNIPPETS, snippetsToStore, true);
    SettingsListener.getSettings(true);
  }

  private static async insertSnippet(data: any) {
    const { file, snippet, range } = data;

    if (!file || !snippet) {
      return;
    }

    await EditorHelper.showFile(data.file);
    Dashboard.resetViewData();

    const editor = window.activeTextEditor;

    if (range) {
      await editor?.edit((builder) => {
        const vsCodeRange = new Range(
          new Position((range as Range).start.line, (range as Range).start.character),
          new Position((range as Range).end.line, (range as Range).end.character)
        );

        builder.replace(vsCodeRange, snippet);
      });
    } else {
      const position = editor?.selection?.active;
      if (!position) {
        return;
      }

      const selection = editor?.selection;
      await editor?.edit((builder) => {
        if (selection !== undefined) {
          builder.replace(selection, snippet);
        } else {
          builder.insert(position, snippet);
        }
      });
    }
  }

  private static async updateSnippetPlaceholders(
    command: DashboardMessage,
    data: { value: string; filePath: string },
    requestId?: string
  ) {
    if (!data.value || !command || !requestId) {
      return;
    }

    let value = data.value;

    if (data.filePath) {
      value = await processArticlePlaceholdersFromPath(data.value, data.filePath);
    }

    const dateFormat = Settings.get(SETTING_DATE_FORMAT) as string;
    value = processTimePlaceholders(value, dateFormat);

    this.sendRequest(command, requestId, value);
  }
}
