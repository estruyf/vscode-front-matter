import * as vscode from 'vscode';
import { TaxonomyType } from '../models';
import { SETTING_TAXONOMY_TAGS, SETTING_TAXONOMY_CATEGORIES, CONFIG_KEY } from '../constants';

export class SettingsHelper {

  public static getConfig(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(CONFIG_KEY);
  }

  /**
   * Return the taxonomy settings
   * 
   * @param type 
   */
  public static getTaxonomy(type: TaxonomyType): string[] {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);
    // Add all the known options to the selection list
    const configSetting = type === TaxonomyType.Tag ? SETTING_TAXONOMY_TAGS : SETTING_TAXONOMY_CATEGORIES;
    const crntOptions = config.get(configSetting) as string[];
    if (crntOptions && crntOptions.length > 0) {
      return crntOptions;
    }
    return [];
  }

  /**
   * Update the taxonomy settings
   * 
   * @param config 
   * @param type 
   * @param options 
   */
  static async update(type: TaxonomyType, options: string[]) {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);
    const configSetting = type === TaxonomyType.Tag ? SETTING_TAXONOMY_TAGS : SETTING_TAXONOMY_CATEGORIES;
    options = [...new Set(options)];
    options = options.sort().filter(o => !!o);
    await config.update(configSetting, options);
  }
}