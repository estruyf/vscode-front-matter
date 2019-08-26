import * as vscode from 'vscode';
import { TaxonomyType } from "../models";
import { CONFIG_KEY, ACTION_TAXONOMY_TAGS, ACTION_TAXONOMY_CATEGORIES, ACTION_DATE_FORMAT } from "../constants/settings";
import * as matter from "gray-matter";
import { format } from "date-fns";

export class FrontMatter {
  
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
   * Export the tags/categories front matter to the user settings
   */
  public static async export() {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);

    // Retrieve all the Markdown files
    const mdFiles = await vscode.workspace.findFiles('**/*.md', "**/node_modules/**");
    const markdownFiles = await vscode.workspace.findFiles('**/*.markdown', "**/node_modules/**");
    if (!mdFiles && !markdownFiles) {
      vscode.window.showInformationMessage(`No MD files found.`);
      return;
    }

    const allMdFiles = mdFiles.concat(markdownFiles);

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `Front Matter: exporting tags and categories`,
      cancellable: false
    }, async (progress) => {
      // Fetching all tags and categories from MD files
      let tags: string[] = [];
      let categories: string[] = [];

      // Set the initial progress
      const progressNr = allMdFiles.length/100;
      progress.report({ increment: 0});

      let i = 0;
      for (const file of allMdFiles) {
        progress.report({ increment: (++i/progressNr) });
        const mdFile = await vscode.workspace.openTextDocument(file);
        if (mdFile) {
          const txtData = mdFile.getText();
          if (txtData) {
            try {
              const article = matter(txtData);
              if (article && article.data) {
                const { data } = article;
                const mdTags = data["tags"];
                const mdCategories = data["categories"];
                if (mdTags) {
                  tags = [...tags, ...mdTags];
                }
                if (mdCategories) {
                  categories = [...categories, ...mdCategories];
                }
              } 
            } catch (e) {
              // Continue with the next file
            }
          }
        }
      }

      // Retrieve the currently known tags, and add the new ones
      let crntTags: string[] = config.get(ACTION_TAXONOMY_TAGS) as string[];
      if (!crntTags) { crntTags = []; }
      crntTags = [...crntTags, ...tags];
      // Update the tags and filter out the duplicates
      crntTags = [...new Set(crntTags)];
      crntTags = crntTags.sort();
      config.update(ACTION_TAXONOMY_TAGS, crntTags);

      // Retrieve the currently known tags, and add the new ones
      let crntCategories: string[] = config.get(ACTION_TAXONOMY_CATEGORIES) as string[];
      if (!crntCategories) { crntCategories = []; }
      crntCategories = [...crntCategories, ...categories];
      // Update the categories and filter out the duplicates
      crntCategories = [...new Set(crntCategories)];
      crntCategories = crntCategories.sort();
      config.update(ACTION_TAXONOMY_CATEGORIES, crntCategories);

      // Done
      vscode.window.showInformationMessage(`Front Matter: export completed. Tags: ${crntTags.length} - Categories: ${crntCategories.length}.`);
    });
  }

  public static async setDate() {
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

    const dateFormat = config.get(ACTION_DATE_FORMAT) as string;
    try {
      if (dateFormat && typeof dateFormat === "string") {
        article.data["date"] = format(new Date(), dateFormat);
      } else {
        article.data["date"] = new Date();
      }
      
      this.updatePage(editor, article);
    } catch (e) {
      vscode.window.showErrorMessage(`Front Matter: Something failed while parsing the date format. Check your "${CONFIG_KEY}${ACTION_DATE_FORMAT}" setting.`);
      console.log(e.message);
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