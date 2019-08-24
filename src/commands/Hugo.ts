import * as vscode from 'vscode';
import { TaxonomyType } from "../models";
import { CONFIG_KEY, ACTION_TAXONOMY_TAGS, ACTION_TAXONOMY_CATEGORIES } from "../constants/settings";
import * as matter from "gray-matter";

export class Hugo {
  
  /**
  * Insert taxonomy
  * 
  * @param type 
  */
  public static async insert(type: TaxonomyType) {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    
    const fileTxt = editor.document.getText();
    const article = matter(fileTxt);
    if (!article || !article.data) {
      return;
    }
    
    let options: vscode.QuickPickItem[] = [];
    const matterProp: string = type === TaxonomyType.Tag ? "tags" : "categories";
    
    // Add the selected options to the options array
    if (article.data[matterProp]) {
      const propData = article.data[matterProp];
      if (propData && propData.length > 0) {
        options = [...propData].map(p => ({
          label: p,
          picked: true
        } as vscode.QuickPickItem));
      }
    }
    
    // Add all the known options to the selection list
    const configSetting = type === TaxonomyType.Tag ? ACTION_TAXONOMY_TAGS : ACTION_TAXONOMY_CATEGORIES;
    const crntOptions = config.get(configSetting) as string[];
    if (crntOptions && crntOptions.length > 0) {
      for (const crntOpt of crntOptions) {
        if (!options.find(o => o.label === crntOpt)) {
          options.push({
            label: crntOpt
          });
        }
      }
    }
    
    if (options.length === 0) {
      vscode.window.showInformationMessage(`No ${type === TaxonomyType.Tag ? "tags" : "categories"} configured.`);
      return;
    }
    
    const selectedOptions = await vscode.window.showQuickPick(options, { 
      placeHolder: `Select your ${type === TaxonomyType.Tag ? "tags" : "categories"} to insert`,
      canPickMany: true 
    });
    
    if (selectedOptions) {
      article.data[matterProp] = selectedOptions.map(o => o.label);
    }
    
    this.updatePage(editor, article);
  }
  
  /**
  * Create a new taxonomy
  * 
  * @param type 
  */
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

      if (options.find(o => o === newOption)) {
        vscode.window.showInformationMessage(`The provided ${type === TaxonomyType.Tag ? "tag" : "category"} already exists.`);
        return;
      }

      options.push(newOption);
      config.update(configSetting, options);

      // Ask if the new term needs to be added to the page
      const addToPage = await vscode.window.showQuickPick(["yes", "no"], { canPickMany: false, placeHolder: `Do you want to add the new ${type === TaxonomyType.Tag ? "tag" : "category"} to the page?` });

      if (addToPage && addToPage === "yes") {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return;
        }

        const fileTxt = editor.document.getText();
        const article = matter(fileTxt);
        if (!article || !article.data) {
          return;
        }

        const matterProp: string = type === TaxonomyType.Tag ? "tags" : "categories";
        // Add the selected options to the options array
        if (article.data[matterProp]) {
          const propData: string[] = article.data[matterProp];
          if (propData && !propData.find(o => o === newOption)) {
            propData.push(newOption);
          }
        } else {
          article.data[matterProp] = [newOption];
        }

        this.updatePage(editor, article);
      }
    }
  }

  /**
   * Store the new information in the file
   * 
   * @param editor 
   * @param article 
   */
  private static updatePage(editor: vscode.TextEditor, article: matter.GrayMatterFile<string>) {
    const newMarkdown = matter.stringify(article.content, article.data);
    const nrOfLines = editor.document.lineCount as number;
    editor.edit(builder => builder.replace(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(nrOfLines, 0)), newMarkdown));
  }
}