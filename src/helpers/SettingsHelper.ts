import { workspace } from 'vscode';
import * as vscode from 'vscode';
import { TaxonomyType } from '../models';
import { SETTING_TAXONOMY_TAGS, SETTING_TAXONOMY_CATEGORIES, CONFIG_KEY } from '../constants';
import { Folders } from '../commands/Folders';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

export class Settings {
  private static config: vscode.WorkspaceConfiguration;
  private static globalConfig: any;

  public static init() {
    const wsFolder = Folders.getWorkspaceFolder();
    if (wsFolder) {
      const fmConfig = join(wsFolder.fsPath, 'frontmatter.json');
      if (existsSync(fmConfig)) {
        const localConfig = readFileSync(fmConfig, 'utf8');
        this.globalConfig = JSON.parse(localConfig);
      }
    }

    this.config = vscode.workspace.getConfiguration(CONFIG_KEY);

    Settings.onConfigChange((global?: any) => {
      if (global) {
        this.globalConfig = Object.assign({}, global);
      } else {
        this.config = vscode.workspace.getConfiguration(CONFIG_KEY);
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

    workspace.onDidChangeTextDocument((e) => {
      if (e.document.fileName === "frontmatter.json") {
        if (e && e.document.fileName === "frontmatter.json") {
          const fileContents = e.document.getText();
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
    const configInpection = this.config.inspect<T>(name);

    let setting = undefined;
    const settingKey = `${CONFIG_KEY}.${name}`;

    if (typeof this.globalConfig[settingKey] !== "undefined") {
      setting = this.globalConfig[settingKey];
    }

    // Local overrides global
    if (configInpection && typeof configInpection.workspaceValue !== undefined) {
      setting = configInpection.workspaceValue;
    }

    return setting;
  }

  /**
   * Retrieves the config
   * @returns 
   */
  public static getConfig(): vscode.WorkspaceConfiguration {
    return this.config;
  }

  /**
   * Update a setting
   * @param name 
   * @param value 
   */
  public static async updateSetting(name: string, value: any) {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);
    await config.update(name, value);
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