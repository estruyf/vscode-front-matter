import { getTaxonomyField } from './getTaxonomyField';
import {
  EXTENSION_NAME,
  LocalStore,
  SETTING_TAXONOMY_CATEGORIES,
  SETTING_TAXONOMY_CUSTOM,
  SETTING_TAXONOMY_TAGS
} from '../constants';
import { CustomTaxonomy, TaxonomyType, ContentType as IContentType } from '../models';
import { FilesHelper } from './FilesHelper';
import { ProgressLocation, window } from 'vscode';
import { parseWinPath } from './parseWinPath';
import { FrontMatterParser } from '../parsers';
import { DumpOptions } from 'js-yaml';
import { Settings } from './SettingsHelper';
import { Notifications } from './Notifications';
import { ArticleHelper } from './ArticleHelper';
import { ContentType } from './ContentType';
import { readFileAsync, writeFileAsync } from '../utils';
import { Config, JsonDB } from 'node-json-db';
import { Folders } from '../commands';
import { join } from 'path';
import { SettingsListener as PanelSettingsListener } from '../listeners/panel';
import { SettingsListener as DashboardSettingsListener } from '../listeners/dashboard';

export class TaxonomyHelper {
  private static db: JsonDB;

  /**
   * Initialize the database
   * @returns
   */
  public static initDb() {
    const wsFolder = Folders.getWorkspaceFolder();
    if (!wsFolder) {
      return;
    }

    const dbFolder = join(
      parseWinPath(wsFolder?.fsPath || ''),
      LocalStore.rootFolder,
      LocalStore.databaseFolder
    );
    const dbPath = join(dbFolder, LocalStore.taxonomyDatabaseFile);

    TaxonomyHelper.db = new JsonDB(new Config(dbPath, true, false, '/'));
  }

  /**
   * Get all the taxonomy values
   */
  public static async getAll() {
    if (!TaxonomyHelper.db) {
      return;
    }

    const taxonomyData = {
      tags: (await TaxonomyHelper.get(TaxonomyType.Tag)) || [],
      categories: (await TaxonomyHelper.get(TaxonomyType.Category)) || [],
      customTaxonomy: Settings.get<CustomTaxonomy[]>(SETTING_TAXONOMY_CUSTOM) || []
    };

    return taxonomyData;
  }

  /**
   * Get the taxonomy settings
   *
   * @param type
   * @param options
   */
  public static async get(type: TaxonomyType): Promise<string[] | undefined> {
    if (!TaxonomyHelper.db) {
      return;
    }

    const tagType = TaxonomyHelper.getTaxonomyDbPath(type);

    let taxonomy: string[] = [];
    if (await TaxonomyHelper.db.exists(tagType)) {
      taxonomy = await TaxonomyHelper.db.getObject<string[]>(tagType);
    }
    return taxonomy;
  }

  /**
   * Update the taxonomy settings
   *
   * @param type
   * @param options
   */
  public static async update(type: TaxonomyType, options: string[]) {
    if (!TaxonomyHelper.db) {
      return;
    }

    const tagType = TaxonomyHelper.getTaxonomyDbPath(type);

    options = [...new Set(options)];
    options = options.sort().filter((o) => !!o);

    await TaxonomyHelper.db.push(tagType, options, true);

    // Trigger the update of the taxonomy
    PanelSettingsListener.getSettings();
    DashboardSettingsListener.getSettings(true);
  }

  /**
   * Get the Taxonomy path of the db entry
   * @param type
   * @returns
   */
  public static getTaxonomyDbPath(type: TaxonomyType) {
    let tagType = type === TaxonomyType.Tag ? SETTING_TAXONOMY_TAGS : SETTING_TAXONOMY_CATEGORIES;
    tagType = tagType.replace('.', '/');
    return `/${tagType}`;
  }

  /**
   * Rename an taxonomy value
   * @param data
   * @returns
   */
  public static async rename(data: { type: string; value: string }) {
    const { type, value } = data;

    const answer = await window.showInputBox({
      title: `Rename the "${value}"`,
      value,
      validateInput: (text) => {
        if (text === value) {
          return 'The new value must be different from the old one.';
        }

        if (!text) {
          return 'A new value must be provided.';
        }

        return null;
      },
      ignoreFocusOut: true
    });

    if (!answer) {
      return;
    }

    this.process('edit', this.getTypeFromString(type), value, answer);
  }

  /**
   * Merge a taxonomy value with another one
   * @param data
   * @returns
   */
  public static async merge(data: { type: string; value: string }) {
    const { type, value } = data;
    const taxonomyType = this.getTypeFromString(type);

    let options = [];
    if (taxonomyType === TaxonomyType.Tag || taxonomyType === TaxonomyType.Category) {
      options = (await TaxonomyHelper.get(taxonomyType)) || [];
    } else {
      options = Settings.getCustomTaxonomy(taxonomyType);
    }

    const answer = await window.showQuickPick(
      options.filter((o) => o !== value),
      {
        title: `Merge the "${value}" with another ${type} value`,
        placeHolder: `Select the ${type} value to merge with`,
        ignoreFocusOut: true
      }
    );

    if (!answer) {
      return;
    }

    this.process('merge', taxonomyType, value, answer);
  }

  /**
   * Delete a taxonomy value
   * @param data
   */
  public static async delete(data: { type: string; value: string }) {
    const { type, value } = data;

    const answer = await window.showQuickPick(['Yes', 'No'], {
      title: `Delete the "${value}" ${type} value`,
      placeHolder: `Are you sure you want to delete the "${value}" ${type} value?`,
      ignoreFocusOut: true
    });

    if (!answer || answer === 'No') {
      return;
    }

    this.process('delete', this.getTypeFromString(type), value, undefined);
  }

  /**
   * Add the taxonomy value to the settings
   * @param data
   */
  public static addTaxonomy(data: { type: string; value: string }) {
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
    const options = await this.getTaxonomyOptions(taxonomyType);

    const newOption = await window.showInputBox({
      title: `Create a new ${type} value`,
      placeHolder: `The value you want to add`,
      ignoreFocusOut: true,
      validateInput: (text) => {
        if (!text) {
          return 'A value must be provided.';
        }

        if (options.includes(text)) {
          return 'The value already exists.';
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
  public static async process(
    type: 'edit' | 'merge' | 'delete',
    taxonomyType: TaxonomyType | string,
    oldValue: string,
    newValue?: string
  ) {
    // Retrieve all the markdown files
    const allFiles = await FilesHelper.getAllFiles();
    if (!allFiles) {
      return;
    }

    let taxonomyName: string;
    if (taxonomyType === TaxonomyType.Tag) {
      taxonomyName = 'tags';
    } else if (taxonomyType === TaxonomyType.Category) {
      taxonomyName = 'categories';
    } else {
      taxonomyName = taxonomyType;
    }

    let progressText = ``;

    if (type === 'edit') {
      progressText = `${EXTENSION_NAME}: Renaming "${oldValue}" from ${taxonomyName} to "${newValue}".`;
    } else if (type === 'merge') {
      progressText = `${EXTENSION_NAME}: Merging "${oldValue}" from "${taxonomyName}" to "${newValue}".`;
    } else if (type === 'delete') {
      progressText = `${EXTENSION_NAME}: Deleting "${oldValue}" from "${taxonomyName}".`;
    }

    window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: progressText,
        cancellable: false
      },
      async (progress) => {
        // Set the initial progress
        const progressNr = allFiles.length / 100;
        progress.report({ increment: 0 });

        let i = 0;
        for (const file of allFiles) {
          progress.report({ increment: ++i / progressNr });

          const mdFile = await readFileAsync(parseWinPath(file.fsPath), {
            encoding: 'utf8'
          });

          if (mdFile) {
            try {
              const article = FrontMatterParser.fromFile(mdFile);
              const contentType = ArticleHelper.getContentType(article.data);

              let fieldNames: string[] = this.getFieldsHierarchy(taxonomyType, contentType);

              if (fieldNames.length > 0 && article && article.data) {
                const { data } = article;
                let taxonomies: string | string[] = ContentType.getFieldValue(data, fieldNames);
                if (typeof taxonomies === 'string') {
                  taxonomies = taxonomies.split(`,`);
                }

                if (taxonomies && taxonomies.length > 0) {
                  const idx = taxonomies.findIndex((o) => o === oldValue);

                  if (idx !== -1) {
                    if (newValue) {
                      taxonomies[idx] = newValue;
                    } else {
                      taxonomies = taxonomies.filter((o) => o !== oldValue);
                    }

                    const newTaxValue = [...new Set(taxonomies)].sort();
                    ContentType.setFieldValue(data, fieldNames, newTaxValue);

                    const spaces = window.activeTextEditor?.options?.tabSize;
                    // Update the file
                    await writeFileAsync(
                      parseWinPath(file.fsPath),
                      FrontMatterParser.toFile(article.content, article.data, mdFile, {
                        indent: spaces || 2
                      } as DumpOptions as any),
                      { encoding: 'utf8' }
                    );
                  }
                }
              }
            } catch (e) {
              // Continue with the next file
            }
          }
        }

        await this.addToSettings(taxonomyType, oldValue, newValue);

        if (type === 'edit') {
          Notifications.info(`Edit completed.`);
        } else if (type === 'merge') {
          Notifications.info(`Merge completed.`);
        } else if (type === 'delete') {
          Notifications.info(`Deletion completed.`);
        }
      }
    );
  }

  /**
   * Move a taxonomy value to another taxonomy type
   * @param data
   * @returns
   */
  public static async move(data: { type: string; value: string }) {
    const { type, value } = data;

    const customTaxs = Settings.get<CustomTaxonomy[]>(SETTING_TAXONOMY_CUSTOM, true) || [];

    let options = ['tags', 'categories', ...customTaxs.map((t) => t.id)];

    options = options.filter((o) => o !== type);

    const answer = await window.showQuickPick(options, {
      title: `Move the "${value}" to another type`,
      placeHolder: `Select the type to move to`,
      ignoreFocusOut: true
    });

    if (!answer) {
      return;
    }

    const oldType = this.getTypeFromString(type);
    const newType = this.getTypeFromString(answer);

    window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: `${EXTENSION_NAME}: Moving "${value}" from ${type} to "${answer}".`,
        cancellable: false
      },
      async (progress) => {
        // Retrieve all the markdown files
        const allFiles = await FilesHelper.getAllFiles();
        if (!allFiles) {
          return;
        }

        // Set the initial progress
        const progressNr = allFiles.length / 100;
        progress.report({ increment: 0 });

        let i = 0;
        for (const file of allFiles) {
          progress.report({ increment: ++i / progressNr });

          const mdFile = await readFileAsync(parseWinPath(file.fsPath), {
            encoding: 'utf8'
          });

          if (mdFile) {
            try {
              const article = FrontMatterParser.fromFile(mdFile);
              const contentType = ArticleHelper.getContentType(article.data);

              let oldFieldNames: string[] = this.getFieldsHierarchy(oldType, contentType);
              let newFieldNames: string[] = this.getFieldsHierarchy(newType, contentType, true);

              if (oldFieldNames.length > 0 && newFieldNames.length > 0 && article && article.data) {
                const { data } = article;
                let oldTaxonomies: string | string[] =
                  ContentType.getFieldValue(data, oldFieldNames) || [];
                let newTaxonomies: string | string[] =
                  ContentType.getFieldValue(data, newFieldNames) || [];

                if (typeof oldTaxonomies === 'string') {
                  oldTaxonomies = oldTaxonomies.split(',');
                }
                if (typeof newTaxonomies === 'string') {
                  newTaxonomies = newTaxonomies.split(',');
                }

                if (oldTaxonomies && oldTaxonomies.length > 0) {
                  const idx = oldTaxonomies.findIndex((o) => o === value);

                  if (idx !== -1) {
                    newTaxonomies.push(value);

                    const newTaxonomiesValues = [...new Set(newTaxonomies)].sort();
                    ContentType.setFieldValue(data, newFieldNames, newTaxonomiesValues);

                    const spaces = window.activeTextEditor?.options?.tabSize;
                    // Update the file
                    await writeFileAsync(
                      parseWinPath(file.fsPath),
                      FrontMatterParser.toFile(article.content, article.data, mdFile, {
                        indent: spaces || 2
                      } as DumpOptions as any),
                      { encoding: 'utf8' }
                    );
                  }
                }
              }
            } catch (e) {
              // Continue with the next file
            }
          }
        }

        await this.addToSettings(newType, value, value);

        await this.process('delete', oldType, value);

        Notifications.info(`Move completed.`);
      }
    );
  }

  /**
   * Retrieve the fields for the taxonomy field
   * @returns
   */
  private static getFieldsHierarchy(
    taxonomyType: TaxonomyType | string,
    contentType: IContentType,
    fallback: boolean = false
  ): string[] {
    let fieldNames: string[] = [];
    if (taxonomyType === TaxonomyType.Tag) {
      fieldNames = ContentType.findFieldByType(contentType.fields, 'tags');
    } else if (taxonomyType === TaxonomyType.Category) {
      fieldNames = ContentType.findFieldByType(contentType.fields, 'categories');
    } else {
      const taxFieldName = getTaxonomyField(taxonomyType, contentType);
      fieldNames = taxFieldName ? [taxFieldName] : [];
    }

    if (fallback && fieldNames.length === 0) {
      let taxFieldName;
      if (taxonomyType === TaxonomyType.Tag) {
        taxFieldName = getTaxonomyField('tags', contentType);
      } else if (taxonomyType === TaxonomyType.Category) {
        taxFieldName = getTaxonomyField('categories', contentType);
      }

      if (taxFieldName) {
        fieldNames = [taxFieldName];
      }
    }

    return fieldNames;
  }

  /**
   * Add the taxonomy value to the settings
   * @param taxonomyType
   * @param oldValue
   * @param newValue
   */
  private static async addToSettings(
    taxonomyType: TaxonomyType | string,
    oldValue: string,
    newValue?: string
  ) {
    // Update the settings
    let options = await this.getTaxonomyOptions(taxonomyType);

    const idx = options.findIndex((o) => o === oldValue);
    if (newValue) {
      // Add or update the new option
      if (idx !== -1) {
        options[idx] = newValue;
      } else {
        options.push(newValue);
      }
    } else {
      // Remove the selected option
      options = options.filter((o) => o !== oldValue);
    }

    if (taxonomyType === TaxonomyType.Tag || taxonomyType === TaxonomyType.Category) {
      TaxonomyHelper.update(taxonomyType, options);
    } else {
      await Settings.updateCustomTaxonomyOptions(taxonomyType, options);
    }
  }

  /**
   * Get the taxonomy options
   * @param taxonomyType
   * @returns
   */
  private static async getTaxonomyOptions(taxonomyType: TaxonomyType | string) {
    let options = [];

    if (taxonomyType === TaxonomyType.Tag || taxonomyType === TaxonomyType.Category) {
      options = (await TaxonomyHelper.get(taxonomyType)) || [];
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
    if (taxonomyType === 'tags') {
      return TaxonomyType.Tag;
    } else if (taxonomyType === 'categories') {
      return TaxonomyType.Category;
    } else {
      return taxonomyType;
    }
  }
}
