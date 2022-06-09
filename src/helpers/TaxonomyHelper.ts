import { EXTENSION_NAME } from "../constants";
import { TaxonomyType } from "../models";
import { FilesHelper } from "./FilesHelper";
import { ProgressLocation, window } from "vscode";
import { parseWinPath } from "./parseWinPath";
import { readFileSync, writeFileSync } from "fs";
import { FrontMatterParser } from "../parsers";
import { DumpOptions } from "js-yaml";
import { Settings } from "./SettingsHelper";
import { Notifications } from "./Notifications";
import { ArticleHelper } from './ArticleHelper';


export class TaxonomyHelper {

  /**
   * Rename an taxonomy value
   * @param data 
   * @returns 
   */
  public static async rename(data: { type: string, value: string }) {
    const { type, value } = data;

    const answer = await window.showInputBox({
      title: `Rename the "${value}"`,
      value,
      validateInput: (text) => {
        if (text === value) {
          return "The new value must be different from the old one.";
        }

        if (!text) {
          return "A new value must be provided.";
        }

        return null;
      },
      ignoreFocusOut: true
    });

    if (!answer) {
      return;
    }

    this.process("edit", this.getTypeFromString(type), value, answer);
  }

  /**
   * Merge a taxonomy value with another one
   * @param data 
   * @returns 
   */
  public static async merge(data: { type: string, value: string }) {
    const { type, value } = data;
    const taxonomyType = this.getTypeFromString(type);

    let options = [];
      if (taxonomyType === TaxonomyType.Tag || taxonomyType === TaxonomyType.Category) {
        options = Settings.getTaxonomy(taxonomyType);
      } else {
        options = Settings.getCustomTaxonomy(taxonomyType);
      }

    const answer = await window.showQuickPick(options.filter(o => o !== value), {
      title: `Merge the "${value}" with another ${type} value`,
      placeHolder: `Select the ${type} value to merge with`,
      ignoreFocusOut: true
    });

    if (!answer) {
      return;
    }

    this.process("merge", taxonomyType, value, answer);
  }

  /**
   * Delete a taxonomy value
   * @param data 
   */
  public static async delete(data: { type: string, value: string }) {
    const { type, value } = data;

    const answer = await window.showQuickPick(["Yes", "No"], {
      title: `Delete the "${value}" ${type} value`,
      placeHolder: `Are you sure you want to delete the "${value}" ${type} value?`,
      ignoreFocusOut: true
    });

    if (!answer || answer === "No") {
      return;
    }

    this.process("delete", this.getTypeFromString(type), value, undefined);
  }

  /**
   * Add the taxonomy value to the settings
   * @param data 
   */
  public static addTaxonomy(data: { type: string, value: string }) {
    const { type, value } = data;
    this.addToSettings(this.getTypeFromString(type), value, value);
  }

  /**
   * Create new taxonomy value
   * @param data 
   */
  public static async createNew(data: { type: string }) {
    const { type } = data;

    const taxonomyType = this.getTypeFromString(type);
    const options = this.getTaxonomyOptions(taxonomyType);

    const newOption = await window.showInputBox({
      title: `Create a new ${taxonomyType} value`,
      placeHolder: `The value you want to add`,
      ignoreFocusOut: true,
      validateInput: (text) => {
        if (!text) {
          return "A value must be provided.";
        }

        if (options.includes(text)) {
          return "The value already exists.";
        }

        return null;
      }
    });

    if (!newOption) {
      return;
    }

    this.addToSettings(taxonomyType, newOption, newOption);
  }

  /**
   * Process the taxonomy changes
   * @param type 
   * @param taxonomyType 
   * @param oldValue 
   * @param newValue 
   * @returns 
   */
  public static async process(type: "edit" | "merge" | "delete", taxonomyType: TaxonomyType | string, oldValue: string, newValue?: string) {
    // Retrieve all the markdown files
    const allFiles = await FilesHelper.getAllFiles();
    if (!allFiles) {
      return;
    }

    let taxonomyName: string;
    if (taxonomyType === TaxonomyType.Tag) {
      taxonomyName = "tags";
    } else if (taxonomyType === TaxonomyType.Category) {
      taxonomyName = "categories";
    } else {
      taxonomyName = taxonomyType;
    }

    let progressText = ``;
    
    if (type === "edit") {
      progressText = `${EXTENSION_NAME}: Renaming "${oldValue}" from ${taxonomyName} to "${newValue}".`;
    } else if (type === "merge") {
      progressText = `${EXTENSION_NAME}: Merging "${oldValue}" from "${taxonomyName}" to "${newValue}".`;
    } else if (type === "delete") {
      progressText = `${EXTENSION_NAME}: Deleting "${oldValue}" from "${taxonomyName}".`;
    }

    window.withProgress({
      location: ProgressLocation.Notification,
      title: progressText,
      cancellable: false
    }, async (progress) => {
      // Set the initial progress
      const progressNr = allFiles.length/100;
      progress.report({ increment: 0});

      let i = 0;
      for (const file of allFiles) {
        progress.report({ increment: (++i/progressNr) });
        
        const mdFile = readFileSync(parseWinPath(file.fsPath), { encoding: "utf8" });

        if (mdFile) {
          try {
            const article = FrontMatterParser.fromFile(mdFile);
            const contentType = ArticleHelper.getContentType(article.data);
            let fieldName: string | undefined;

            if (taxonomyName === "tags") {
              fieldName = contentType.fields.find(f => f.type === "tags")?.name || "tags";
            } else if (taxonomyName === "categories") {
              fieldName = contentType.fields.find(f => f.type === "categories")?.name || "categories";
            } else {
              fieldName = contentType.fields.find(f => f.type === "taxonomy" && f.taxonomyId === taxonomyName)?.name;
            }

            if (fieldName && article && article.data) {
              const { data } = article;
              let taxonomies: string[] = data[fieldName];

              if (taxonomies && taxonomies.length > 0) {
                const idx = taxonomies.findIndex(o => o === oldValue);

                if (idx !== -1) {
                  if (newValue) {
                    taxonomies[idx] = newValue;
                  } else {
                    taxonomies = taxonomies.filter(o => o !== oldValue);
                  }

                  data[fieldName] = [...new Set(taxonomies)].sort();

                  const spaces = window.activeTextEditor?.options?.tabSize;
                  // Update the file
                  writeFileSync(parseWinPath(file.fsPath), FrontMatterParser.toFile(article.content, article.data, mdFile, {
                    indent: spaces || 2
                  } as DumpOptions as any), { encoding: "utf8" });
                }
              }
            } 
          } catch (e) {
            // Continue with the next file
          }
        }
      }
      
      await this.addToSettings(taxonomyType, oldValue, newValue);

      if (type === "edit") {
        Notifications.info(`Edit completed.`);
      } else if (type === "merge") {
        Notifications.info(`Merge completed.`);
      } else if (type === "delete") {
        Notifications.info(`Deletion completed.`);
      }
    });
  }

  /**
   * Add the taxonomy value to the settings
   * @param taxonomyType 
   * @param oldValue 
   * @param newValue 
   */
  private static async addToSettings(taxonomyType: TaxonomyType | string, oldValue: string, newValue?: string) {
    // Update the settings
    let options = this.getTaxonomyOptions(taxonomyType);

    const idx = options.findIndex(o => o === oldValue);
    if (newValue) {
      // Add or update the new option
      if (idx !== -1) {
        options[idx] = newValue;
      } else {
        options.push(newValue);
      }
    } else {
      // Remove the selected option
      options = options.filter(o => o !== oldValue);
    }
    
    if (taxonomyType === TaxonomyType.Tag || taxonomyType === TaxonomyType.Category) {
      await Settings.updateTaxonomy(taxonomyType, options);
    } else {
      await Settings.updateCustomTaxonomyOptions(taxonomyType, options);
    }
  }

  /**
   * Get the taxonomy options
   * @param taxonomyType 
   * @returns 
   */
  private static getTaxonomyOptions(taxonomyType: TaxonomyType | string) {
    let options = [];

    if (taxonomyType === TaxonomyType.Tag || taxonomyType === TaxonomyType.Category) {
      options = Settings.getTaxonomy(taxonomyType);
    } else {
      options = Settings.getCustomTaxonomy(taxonomyType);
    }

    return options;
  }

  /**
   * Retrieve the taxonomy type based from the string
   * @param taxonomyType 
   * @returns 
   */
  private static getTypeFromString(taxonomyType: string): TaxonomyType | string {
    if (taxonomyType === "tags") {
      return TaxonomyType.Tag;
    } else if (taxonomyType === "categories") {
      return TaxonomyType.Category;
    } else {
      return taxonomyType;
    }
  }
}