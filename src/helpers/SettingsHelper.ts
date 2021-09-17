import { workspace } from 'vscode';
import * as vscode from 'vscode';
import { TaxonomyType } from '../models';
import { SETTING_TAXONOMY_TAGS, SETTING_TAXONOMY_CATEGORIES, CONFIG_KEY } from '../constants';
import { Folders } from '../commands/Folders';
import { join, basename } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

export class Settings {
  private static config: vscode.WorkspaceConfiguration;
  private static globalFile = "frontmatter.json";
  private static globalConfig: any;

  public static init() {
    const wsFolder = Folders.getWorkspaceFolder();
    if (wsFolder) {
      const fmConfig = join(wsFolder.fsPath, Settings.globalFile);
      if (existsSync(fmConfig)) {
        const localConfig = readFileSync(fmConfig, 'utf8');
        Settings.globalConfig = JSON.parse(localConfig);
      }
    }

    Settings.config = vscode.workspace.getConfiguration(CONFIG_KEY);

    Settings.onConfigChange((global?: any) => {
      if (global) {
        Settings.globalConfig = Object.assign({}, global);
      } else {
        Settings.config = vscode.workspace.getConfiguration(CONFIG_KEY);
      }
    });
  }

  /**
   * Check for config changes on global and local settings
   * @param callback 
   */
  public static onConfigChange(callback: (global?: any) => void) {
    workspace.onDidChangeConfiguration(() => {
      callback();
    });

    workspace.onDidSaveTextDocument(async (e) => {
      const filename = e.uri.fsPath;
      if (filename && basename(filename).toLowerCase() === Settings.globalFile.toLowerCase()) {
        const file = await workspace.openTextDocument(e.uri);
        if (file) {
          const fileContents = file.getText();
          const json = JSON.parse(fileContents);
          callback(json);
        }
      }
    });
  }

  /**
   * Retrieve a setting from global and local config
   */
  public static get<T>(name: string): T | undefined{
    const configInpection = Settings.config.inspect<T>(name);

    let setting = undefined;
    const settingKey = `${CONFIG_KEY}.${name}`;

    if (typeof Settings.globalConfig[settingKey] !== "undefined") {
      setting = Settings.globalConfig[settingKey];
    }

    // Local overrides global
    if (configInpection && typeof configInpection.workspaceValue !== "undefined") {
      setting = configInpection.workspaceValue;
    }

    if (setting === undefined) {
      setting = Settings.config.get(name);
    }

    return setting;
  }

  /**
   * String update config setting
   * @param name 
   * @param value 
   */
  public static async update<T>(name: string, value: T, updateGlobal: boolean = false) {
    const wsFolder = Folders.getWorkspaceFolder();

    if (updateGlobal) {
      if (wsFolder) {
        const fmConfig = join(wsFolder.fsPath, Settings.globalFile);
        if (existsSync(fmConfig)) {
          const localConfig = readFileSync(fmConfig, 'utf8');
          Settings.globalConfig = JSON.parse(localConfig);
          Settings.globalConfig[`${CONFIG_KEY}.${name}`] = value;
          writeFileSync(fmConfig, JSON.stringify(Settings.globalConfig, null, 2), 'utf8');
          return;
        }
      }
    } else {
      await Settings.config.update(name, value);
      return;
    }

    // Fallback to the local settings
    await Settings.config.update(name, value);
  }

  /**
   * Retrieves the config
   * @returns 
   */
  public static getConfig(): vscode.WorkspaceConfiguration {
    return Settings.config;
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
  static async updateTaxonomy(type: TaxonomyType, options: string[]) {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);
    const configSetting = type === TaxonomyType.Tag ? SETTING_TAXONOMY_TAGS : SETTING_TAXONOMY_CATEGORIES;
    options = [...new Set(options)];
    options = options.sort().filter(o => !!o);
    await config.update(configSetting, options);
  }
}