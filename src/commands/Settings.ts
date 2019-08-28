import * as vscode from 'vscode';
import * as matter from 'gray-matter';
import * as fs from 'fs';
import { TaxonomyType } from "../models";
import { CONFIG_KEY, ACTION_TAXONOMY_TAGS, ACTION_TAXONOMY_CATEGORIES } from '../constants';
import { ArticleHelper, SettingsHelper, FilesHelper } from '../helpers';

export class Settings {
  
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
      await SettingsHelper.update(type, options);

      // Ask if the new term needs to be added to the page
      const addToPage = await vscode.window.showQuickPick(["yes", "no"], { canPickMany: false, placeHolder: `Do you want to add the new ${type === TaxonomyType.Tag ? "tag" : "category"} to the page?` });

      if (addToPage && addToPage === "yes") {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return;
        }

        const article = ArticleHelper.getFrontMatter(editor);
        if (!article) {
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

        ArticleHelper.update(editor, article);
      }
    }
  }


  /**
   * Export the tags/categories front matter to the user settings
   */
  public static async export() {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);

    // Retrieve all the Markdown files
    const allMdFiles = await FilesHelper.getMdFiles();
    if (!allMdFiles) {
      return;
    }

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
      await config.update(ACTION_TAXONOMY_TAGS, crntTags);

      // Retrieve the currently known tags, and add the new ones
      let crntCategories: string[] = config.get(ACTION_TAXONOMY_CATEGORIES) as string[];
      if (!crntCategories) { crntCategories = []; }
      crntCategories = [...crntCategories, ...categories];
      // Update the categories and filter out the duplicates
      crntCategories = [...new Set(crntCategories)];
      crntCategories = crntCategories.sort();
      await config.update(ACTION_TAXONOMY_CATEGORIES, crntCategories);

      // Done
      vscode.window.showInformationMessage(`Front Matter: export completed. Tags: ${crntTags.length} - Categories: ${crntCategories.length}.`);
    });
  }


  /**
   * Remap a tag or category to a new one
   */
  public static async remap() {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);

    const taxType = await vscode.window.showQuickPick([
      "Tag",
      "Category"
    ], { 
      placeHolder: `What do you want to remap?`,
      canPickMany: false 
    });
    if (!taxType) {
      return;
    }

    const type = taxType === "Tag" ? TaxonomyType.Tag : TaxonomyType.Category;
    const options = SettingsHelper.getTaxonomy(type);
    
    if (!options || options.length === 0) {
      vscode.window.showInformationMessage(`No ${type === TaxonomyType.Tag ? "tags" : "categories"} configured.`);
      return;
    }

    const selectedOption = await vscode.window.showQuickPick(options, { 
      placeHolder: `Select your ${type === TaxonomyType.Tag ? "tags" : "categories"} to insert`,
      canPickMany: false 
    });

    if (!selectedOption) {
      return;
    }

    const newOptionValue = await vscode.window.showInputBox({  
      prompt: `Insert the value of the ${type === TaxonomyType.Tag ? "tag" : "category"} with which you want to remap "${selectedOption}".`,
      placeHolder: `Name of the ${type === TaxonomyType.Tag ? "tag" : "category"}`
    });

    if (!newOptionValue) {
      vscode.window.showInformationMessage(`You didn't provide a new value.`);
      return;
    }

    // Retrieve all the markdown files
    const allMdFiles = await FilesHelper.getMdFiles();
    if (!allMdFiles) {
      return;
    }

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `Front Matter: remapping "${selectedOption}" ${type === TaxonomyType.Tag ? "tag" : "category"} to "${newOptionValue}".`,
      cancellable: false
    }, async (progress) => {
      // Set the initial progress
      const progressNr = allMdFiles.length/100;
      progress.report({ increment: 0});

      const matterProp: string = type === TaxonomyType.Tag ? "tags" : "categories";

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
                const options: string[] = data[matterProp];
                if (options && options.length > 0) {
                  const idx = options.findIndex(o => o === selectedOption);
                  if (idx !== -1) {
                    options[idx] = newOptionValue;
                    data[matterProp] = [...new Set(options)].sort();

                    // Update the file
                    fs.writeFileSync(mdFile.fileName, matter.stringify(article.content, article.data), { encoding: "utf8" });
                  }
                }
              } 
            } catch (e) {
              // Continue with the next file
            }
          }
        }
      }
      
      // Update the settings
      const idx = options.findIndex(o => o === selectedOption);
      if (idx !== -1) {
        options[idx] = newOptionValue;
      } else {
        options.push(newOptionValue);
      }
      await SettingsHelper.update(type, options);
    });
  }
}