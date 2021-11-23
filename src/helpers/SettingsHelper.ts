import { Notifications } from './Notifications';
import { commands, Uri, workspace, window } from 'vscode';
import * as vscode from 'vscode';
import { ContentType, CustomTaxonomy, TaxonomyType } from '../models';
import { SETTING_TAXONOMY_TAGS, SETTING_TAXONOMY_CATEGORIES, CONFIG_KEY, CONTEXT, ExtensionState, SETTING_TAXONOMY_CUSTOM } from '../constants';
import { Folders } from '../commands/Folders';
import { join, basename } from 'path';
import { existsSync, readFileSync, watch, writeFileSync } from 'fs';
import { Extension } from './Extension';

export class Settings {
  public static globalFile = "frontmatter.json";
  private static config: vscode.WorkspaceConfiguration;
  private static globalConfig: any;
  
  public static init() {
    const fmConfig = Settings.projectConfigPath;
    if (fmConfig && existsSync(fmConfig)) {
      const localConfig = readFileSync(fmConfig, 'utf8');
      Settings.globalConfig = JSON.parse(localConfig);
      commands.executeCommand('setContext', CONTEXT.isEnabled, true);
    } else {
      Settings.globalConfig = undefined;
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
   * Check if the setting is present in the workspace and ask to promote them to the global settings
   */
  public static async checkToPromote() {
    const isPromoted = await Extension.getInstance().getState<boolean | undefined>(ExtensionState.SettingPromoted, "workspace");
    if (!isPromoted) {
      if (Settings.hasSettings()) {
        window.showInformationMessage(`You have local settings. Would you like to promote them to the global settings ("frontmatter.json")?`, 'Yes', 'No').then(async (result) => {
          if (result === "Yes") {
            Settings.promote();
          }

          if (result === "No" || result === "Yes") {
            Extension.getInstance().setState(ExtensionState.SettingPromoted, true, "workspace");
          }
        });
      }
    }
  }

  /**
   * Check for config changes on global and local settings
   * @param callback 
   */
  public static onConfigChange(callback: (global?: any) => void) {
    const projectConfig = Settings.projectConfigPath;

    workspace.onDidChangeConfiguration(() => {
      callback();
    });

    // Background listener for when it is not a user interaction
    if (projectConfig && existsSync(projectConfig)) {
      watch(projectConfig, () => {
        callback();
      });
    }

    workspace.onDidSaveTextDocument(async (e) => {
      const filename = e.uri.fsPath;

      if (Settings.checkProjectConfig(filename)) {
        const file = await workspace.openTextDocument(e.uri);
        if (file) {
          const fileContents = file.getText();
          const json = JSON.parse(fileContents);
          callback(json);
        }
      }
    });

    workspace.onDidDeleteFiles((e) => {
      const needCallback = e?.files.find(f => Settings.checkProjectConfig(f.fsPath));
      if (needCallback) {
        callback();
      }
    });
  }

  /**
   * Retrieve a setting from global and local config
   */
  public static get<T>(name: string, merging: boolean = false): T | undefined{
    const configInpection = Settings.config.inspect<T>(name);

    let setting = undefined;
    const settingKey = `${CONFIG_KEY}.${name}`;

    if (Settings.globalConfig && typeof Settings.globalConfig[settingKey] !== "undefined") {
      setting = Settings.globalConfig[settingKey];
    }

    // Local overrides global
    if (configInpection && typeof configInpection.workspaceValue !== "undefined") {
      if (merging && setting && typeof setting === "object") {
        setting = Object.assign([], setting, configInpection.workspaceValue);
      } else {
        setting = configInpection.workspaceValue;
      }
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
    const fmConfig = Settings.projectConfigPath;

    if (updateGlobal) {
      if (fmConfig && existsSync(fmConfig)) {
        const localConfig = readFileSync(fmConfig, 'utf8');
        Settings.globalConfig = JSON.parse(localConfig);
        Settings.globalConfig[`${CONFIG_KEY}.${name}`] = value;
        writeFileSync(fmConfig, JSON.stringify(Settings.globalConfig, null, 2), 'utf8');
        
        const workspaceSettingValue = Settings.hasWorkspaceSettings<ContentType[]>(name);
        if (workspaceSettingValue) {
          await Settings.update(name, undefined);
        }

        return;
      }
    } else {
      await Settings.config.update(name, value);
      return;
    }

    // Fallback to the local settings
    await Settings.config.update(name, value);
  }

  /**
   * Create team settings
   */
  public static createTeamSettings() {
    const wsFolder = Folders.getWorkspaceFolder();
    this.createGlobalFile(wsFolder);
  }

  public static createGlobalFile(wsFolder: Uri | undefined | null) {
    const initialConfig = {
      "$schema": `https://${Extension.getInstance().isBetaVersion() ? `beta.` : ``}frontmatter.codes/frontmatter.schema.json`
    };

    if (wsFolder) {
      const configPath = join(wsFolder.fsPath, Settings.globalFile);
      if (!existsSync(configPath)) {
        writeFileSync(configPath, JSON.stringify(initialConfig, null, 2), 'utf8');
      }
    }
  }

  /**
   * Return the taxonomy settings
   * 
   * @param type 
   */
  public static getTaxonomy(type: TaxonomyType): string[] {
    // Add all the known options to the selection list
    const configSetting = type === TaxonomyType.Tag ? SETTING_TAXONOMY_TAGS : SETTING_TAXONOMY_CATEGORIES;
    const crntOptions = Settings.get(configSetting, true) as string[];
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
  public static async updateTaxonomy(type: TaxonomyType, options: string[]) {
    const configSetting = type === TaxonomyType.Tag ? SETTING_TAXONOMY_TAGS : SETTING_TAXONOMY_CATEGORIES;
    options = [...new Set(options)];
    options = options.sort().filter(o => !!o);
    await Settings.update(configSetting, options, true);
  }

  /**
   * Update the custom taxonomy settings
   * 
   * @param config 
   * @param type 
   * @param options 
   */
  public static async updateCustomTaxonomy(id: string, option: string) {
    const customTaxonomies = Settings.get<CustomTaxonomy[]>(SETTING_TAXONOMY_CUSTOM, true) || [];
    let taxIdx = customTaxonomies?.findIndex(o => o.id === id);

    if (taxIdx === -1) {
      customTaxonomies.push({
        id,
        options: []
      } as CustomTaxonomy);

      taxIdx = customTaxonomies?.findIndex(o => o.id === id);
    }

    customTaxonomies[taxIdx].options.push(option);
    customTaxonomies[taxIdx].options = [...new Set(customTaxonomies[taxIdx].options)];
    customTaxonomies[taxIdx].options = customTaxonomies[taxIdx].options.sort().filter(o => !!o);
    await Settings.update(SETTING_TAXONOMY_CUSTOM, customTaxonomies, true);
  }

  /**
   * Promote settings from local to team level
   */
  public static async promote() {
    const pkg = Extension.getInstance().packageJson;
    if (pkg?.contributes?.configuration?.properties) {
      const settingNames = Object.keys(pkg.contributes.configuration.properties);

      for (const name of settingNames) {
        const settingName = name.replace(`${CONFIG_KEY}.`, '');
        const setting = Settings.config.inspect(settingName);

        if (setting && typeof setting.workspaceValue !== "undefined") {
          await Settings.update(settingName, setting.workspaceValue, true);
          await Settings.update(settingName, undefined);
        }
      }
    }

    Notifications.info(`All settings promoted to team level.`);
  }

  /**
   * Check if the setting is present in the workspace
   * @param name 
   * @returns 
   */
  public static hasWorkspaceSettings<T>(name: string): T | undefined {
    const setting = Settings.config.inspect<T>(name);
    return (setting && typeof setting.workspaceValue !== "undefined") ? setting.workspaceValue : undefined;
  }

  /**
   * Check if there are any Front Matter settings in the workspace
   * @returns 
   */
  public static hasSettings() {
    let hasSetting = false;

    const pkg = Extension.getInstance().packageJson;
    if (pkg?.contributes?.configuration?.properties) {
      const settingNames = Object.keys(pkg.contributes.configuration.properties);

      for (const name of settingNames) {
        const settingName = name.replace(`${CONFIG_KEY}.`, '');
        const setting = Settings.config.inspect(settingName);

        if (setting && typeof setting.workspaceValue !== "undefined") {
          hasSetting = true;
        }
      }
    }

    return hasSetting;
  }

  /**
   * Check if its the project config
   * @param filePath 
   * @returns 
   */
  private static checkProjectConfig(filePath: string) {
    const fmConfig = Settings.projectConfigPath;
    if (fmConfig && existsSync(fmConfig)) {
      return filePath && 
             basename(filePath).toLowerCase() === Settings.globalFile.toLowerCase() &&
             fmConfig.toLowerCase() === filePath.toLowerCase();
    }

    return false;
  }

  /**
   * Get the project config path
   * @returns 
   */
  private static get projectConfigPath() {
    const wsFolder = Folders.getWorkspaceFolder();
    if (wsFolder) {
      const fmConfig = join(wsFolder.fsPath, Settings.globalFile);
      return fmConfig;
    }
    return undefined;
  }
}