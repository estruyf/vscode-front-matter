import * as vscode from 'vscode';
import { TaxonomyType } from "../models";
import { CONFIG_KEY, ACTION_TAXONOMY_TAGS, ACTION_TAXONOMY_CATEGORIES } from "../constants/settings";

export class Hugo {

  public static async insert(type: TaxonomyType) {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);

    let options: vscode.QuickPickItem[] = [];
    const configSetting = type === TaxonomyType.Tag ? ACTION_TAXONOMY_TAGS : ACTION_TAXONOMY_CATEGORIES;
    const crntOptions = config.get(configSetting) as string[];
    if (crntOptions && crntOptions.length > 0) {
      options = crntOptions.map(o => ({
        label: o
      }) as vscode.QuickPickItem);
    }

    if (options.length === 0) {
      vscode.window.showInformationMessage(`No ${type === TaxonomyType.Tag ? "tags" : "categories"} configured.`);
      return;
    }

    const selectedOptions = await vscode.window.showQuickPick(options, { 
      placeHolder: `Select your ${type === TaxonomyType.Tag ? "tags" : "categories"} to insert`,
      canPickMany: true 
    });
    if (selectedOptions && selectedOptions.length > 0) {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        await editor.edit(builder => {
          builder.insert(editor.selection.start, selectedOptions.map(o => `"${o.label}"`).join(`, `));
        });
      }
    }
  }

  public static async create(type: TaxonomyType) {
    const newOption = await vscode.window.showInputBox({  
      prompt: `Insert the value of the ${type === TaxonomyType.Tag ? "tag" : "category"} that you want to add to your configuration.`,
      placeHolder: `Name of the ${type === TaxonomyType.Tag ? "tag" : "category"}`
    });

    if (newOption) {
      const config = vscode.workspace.getConfiguration(CONFIG_KEY);
      const configSetting = type === TaxonomyType.Tag ? ACTION_TAXONOMY_TAGS : ACTION_TAXONOMY_CATEGORIES;
      let options = config.get(configSetting) as string[];
      if (!options) {
        options = [];
      }
      options.push(newOption);
      config.update(configSetting, options);
    }
  }
}