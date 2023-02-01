import { TaxonomyHelper } from './../helpers/TaxonomyHelper';
import * as vscode from 'vscode';
import { TaxonomyType } from "../models";
import { SETTING_TAXONOMY_TAGS, SETTING_TAXONOMY_CATEGORIES, EXTENSION_NAME } from '../constants';
import { ArticleHelper, Settings as SettingsHelper, FilesHelper } from '../helpers';
import { FrontMatterParser } from '../parsers';
import { Notifications } from '../helpers/Notifications';

export class Settings {
  
  /**
   * Create a new taxonomy
   * 
   * @param type 
   */
  public static async create(type: TaxonomyType) {
    const newOption = await vscode.window.showInputBox({
      prompt: `Insert the value of the ${type === TaxonomyType.Tag ? "tag" : "category"} that you want to add to your configuration.`,
      placeHolder: `Name of the ${type === TaxonomyType.Tag ? "tag" : "category"}`,
      ignoreFocusOut: true
    });
    
    if (newOption) {
      const configSetting = type === TaxonomyType.Tag ? SETTING_TAXONOMY_TAGS : SETTING_TAXONOMY_CATEGORIES;
      let options = SettingsHelper.get(configSetting, true) as string[];
      if (!options) {
        options = [];
      }

      if (options.find(o => o === newOption)) {
        Notifications.info(`The provided ${type === TaxonomyType.Tag ? "tag" : "category"} already exists.`);
        return;
      }

      options.push(newOption);
      await SettingsHelper.updateTaxonomy(type, options);

      // Ask if the new term needs to be added to the page
      const addToPage = await vscode.window.showQuickPick(["yes", "no"], { 
        canPickMany: false, 
        placeHolder: `Do you want to add the new ${type === TaxonomyType.Tag ? "tag" : "category"} to the page?`,
        ignoreFocusOut: true
      });

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
    // Retrieve all the Markdown files
    const allMdFiles = await FilesHelper.getAllFiles();
    if (!allMdFiles) {
      return;
    }

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `${EXTENSION_NAME}: exporting tags and categories`,
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
              const article = FrontMatterParser.fromFile(txtData);
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
      let crntTags: string[] = SettingsHelper.get(SETTING_TAXONOMY_TAGS, true) as string[];
      if (!crntTags) { crntTags = []; }
      crntTags = [...crntTags, ...tags];
      // Update the tags and filter out the duplicates
      crntTags = [...new Set(crntTags)];
      crntTags = crntTags.sort().filter(t => !!t);
      await SettingsHelper.update(SETTING_TAXONOMY_TAGS, crntTags, true);

      // Retrieve the currently known tags, and add the new ones
      let crntCategories: string[] = SettingsHelper.get(SETTING_TAXONOMY_CATEGORIES, true) as string[];
      if (!crntCategories) { crntCategories = []; }
      crntCategories = [...crntCategories, ...categories];
      // Update the categories and filter out the duplicates
      crntCategories = [...new Set(crntCategories)];
      crntCategories = crntCategories.sort().filter(c => !!c);
      await SettingsHelper.update(SETTING_TAXONOMY_CATEGORIES, crntCategories, true);

      // Done
      Notifications.info(`Export completed. Tags: ${crntTags.length} - Categories: ${crntCategories.length}.`);
    });
  }


  /**
   * Remap a tag or category to a new one
   */
  public static async remap() {
    const taxType = await vscode.window.showQuickPick([
      "Tag",
      "Category"
    ], {
      title: `Remap`,
      placeHolder: `What do you want to remap?`,
      canPickMany: false,
      ignoreFocusOut: true
    });

    if (!taxType) {
      return;
    }

    const type = taxType === "Tag" ? TaxonomyType.Tag : TaxonomyType.Category;
    const options = SettingsHelper.getTaxonomy(type);
    
    if (!options || options.length === 0) {
      Notifications.info(`No ${type === TaxonomyType.Tag ? "tags" : "categories"} configured.`);
      return;
    }

    const selectedOption = await vscode.window.showQuickPick(options, { 
      placeHolder: `Select your ${type === TaxonomyType.Tag ? "tags" : "categories"} to insert`,
      canPickMany: false,
      ignoreFocusOut: true
    });

    if (!selectedOption) {
      return;
    }

    const newOptionValue = await vscode.window.showInputBox({  
      prompt: `Specify the value of the ${type === TaxonomyType.Tag ? "tag" : "category"} with which you want to remap "${selectedOption}". Leave the input <blank> if you want to remove the ${type === TaxonomyType.Tag ? "tag" : "category"} from all articles.`,
      placeHolder: `Name of the ${type === TaxonomyType.Tag ? "tag" : "category"}`,
      ignoreFocusOut: true
    });

    if (!newOptionValue) {
      const deleteAnswer = await vscode.window.showQuickPick(["yes", "no"], { 
        canPickMany: false, 
        placeHolder: `Delete ${selectedOption} ${type === TaxonomyType.Tag ? "tag" : "category"}?`,
        ignoreFocusOut: true
      });
      if (deleteAnswer === "no") {
        return;
      }
    }

    if (newOptionValue) {
      TaxonomyHelper.process("edit", type, selectedOption, newOptionValue);
    } else {
      TaxonomyHelper.process("delete", type, selectedOption, undefined);
    }
  }
}