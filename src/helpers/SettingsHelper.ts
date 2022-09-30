import { parseWinPath } from './parseWinPath';
import { Telemetry } from './Telemetry';
import { Notifications } from './Notifications';
import { commands, Uri, workspace, window } from 'vscode';
import * as vscode from 'vscode';
import { ContentType, CustomTaxonomy, TaxonomyType } from '../models';
import { SETTING_TAXONOMY_TAGS, SETTING_TAXONOMY_CATEGORIES, CONFIG_KEY, CONTEXT, ExtensionState, SETTING_TAXONOMY_CUSTOM, TelemetryEvent, COMMAND_NAME, SETTING_TAXONOMY_CONTENT_TYPES, SETTING_CONTENT_PAGE_FOLDERS, SETTING_CONTENT_SNIPPETS, SETTING_CONTENT_PLACEHOLDERS, SETTING_CUSTOM_SCRIPTS, SETTING_DATA_FILES, SETTING_DATA_TYPES, SETTING_DATA_FOLDERS } from '../constants';
import { Folders } from '../commands/Folders';
import { join, basename, dirname, parse } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { Extension } from './Extension';
import { debounceCallback } from './DebounceCallback';
import { Logger } from './Logger';
import * as jsoncParser from 'jsonc-parser';

export class Settings {
  public static globalFile = "frontmatter.json";
  public static globalConfigFolder = ".frontmatter/config";
  public static globalConfig: any;
  private static config: vscode.WorkspaceConfiguration;
  private static isInitialized: boolean = false;
  private static listeners: any[] = [];
  private static fileCreationWatcher: vscode.FileSystemWatcher | undefined;
  private static readConfigPromise: Promise<void> | undefined = undefined;
  
  public static async init() {
    await Settings.readConfig();

    Settings.listeners = [];

    if (!Settings.isInitialized) {
      Settings.isInitialized = true;

      commands.registerCommand(COMMAND_NAME.reloadConfig, Settings.rebindWatchers)
    }

    Settings.config = vscode.workspace.getConfiguration(CONFIG_KEY);

    Settings.onConfigChange(async () => {
      Settings.config = vscode.workspace.getConfiguration(CONFIG_KEY);
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
    const configDebouncer = debounceCallback();

    workspace.onDidChangeConfiguration(() => {
      callback();
    });

    // Keep track of the listeners
    Settings.listeners.push(callback);

    if (projectConfig && !existsSync(projectConfig)) {
      // No config file, no need to watch
      Settings.createFileCreationWatcher();
      return;
    }

    // Background listener for when it is not a user interaction
    if (projectConfig && existsSync(projectConfig)) {
      let watcher = workspace.createFileSystemWatcher(projectConfig, true, false, true);
      watcher.onDidChange(async (uri: Uri) => {
        Logger.info(`Config change detected - ${projectConfig} changed`);
        configDebouncer(() => callback(), 200);
        // callback()
      });
    }

    workspace.onDidSaveTextDocument(async (e) => {
      const filename = e.uri.fsPath;

      if (Settings.checkProjectConfig(filename)) {
        Logger.info(`Config change detected - ${projectConfig} saved`);

        Logger.info(`Reloading config...`);
        if (Settings.readConfigPromise === undefined) {
          Settings.readConfigPromise = Settings.readConfig();
        }
        await Settings.readConfigPromise;

        Logger.info(`Reloaded config...`);
        configDebouncer(() => callback(), 200);
      }
    });

    workspace.onDidDeleteFiles(async (e) => {
      const needCallback = e?.files.find(f => Settings.checkProjectConfig(f.fsPath));
      if (needCallback) {
        Logger.info(`Reloading config...`);
        if (Settings.readConfigPromise === undefined) {
          Settings.readConfigPromise = Settings.readConfig();
        }
        await Settings.readConfigPromise;
         
        callback();
      }
    });
  }

  /**
   * Inspect a setting
   * @param name 
   * @returns 
   */
  public static inspect<T>(name: string): any {
    const configInpection = Settings.config.inspect<T>(name);
    const settingKey = `${CONFIG_KEY}.${name}`;
    const teamValue = Settings.globalConfig && typeof Settings.globalConfig[settingKey] !== "undefined" ? Settings.globalConfig[settingKey] : undefined;

    return {
      ...configInpection,
      teamValue
    };
  }

  /**
   * Retrieve a setting from global and local config
   */
  public static get<T>(name: string, merging: boolean = false): T | undefined {
    if (!Settings.config) {
      return;
    }

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
        Settings.globalConfig = jsoncParser.parse(localConfig);
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
   * Checks if the project contains the frontmatter.json file
   */
  public static hasProjectFile() {
    const wsFolder = Folders.getWorkspaceFolder();
    const configPath = join(wsFolder?.fsPath || "", Settings.globalFile);
    return existsSync(configPath);
  }

  /**
   * Create team settings
   */
  public static createTeamSettings() {
    const wsFolder = Folders.getWorkspaceFolder();
    this.createGlobalFile(wsFolder);
  }

  /**
   * Create the frontmatter.json file
   * @param wsFolder 
   */
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
   * Return the taxonomy settings
   * 
   * @param type 
   */
  public static getCustomTaxonomy(type: string): string[] {
    const customTaxs = Settings.get<CustomTaxonomy[]>(SETTING_TAXONOMY_CUSTOM, true);
    if (customTaxs && customTaxs.length > 0) {
      return customTaxs.find(t => t.id === type)?.options || [];
    }
    return [];
  }

  /**
   * Update the taxonomy settings
   * 
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
   * Update the taxonomy settings
   * 
   * @param type 
   * @param options 
   */
  public static async updateCustomTaxonomyOptions(id: string, options: string[]) {
    const customTaxonomies = Settings.get<CustomTaxonomy[]>(SETTING_TAXONOMY_CUSTOM, true) || [];
    let taxIdx = customTaxonomies?.findIndex(o => o.id === id);

    if (taxIdx !== -1) {
      customTaxonomies[taxIdx].options = options;
    }
    
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

    Telemetry.send(TelemetryEvent.promoteSettings);
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
   * Get the project config path
   * @returns 
   */
  public static get projectConfigPath() {
    const wsFolder = Folders.getWorkspaceFolder();
    if (wsFolder) {
      const fmConfig = join(wsFolder.fsPath, Settings.globalFile);
      return fmConfig;
    }
    return undefined;
  }

  /**
   * Check if its the project config
   * @param filePath 
   * @returns 
   */
  private static checkProjectConfig(filePath: string) {
    const fmConfig = Settings.projectConfigPath;
    filePath = parseWinPath(filePath);

    if (filePath.includes(Settings.globalConfigFolder)) {
      return true;
    } else if (fmConfig && existsSync(fmConfig)) {
      return filePath && 
             basename(filePath).toLowerCase() === Settings.globalFile.toLowerCase() &&
             fmConfig.toLowerCase() === filePath.toLowerCase();
    }

    return false;
  }

  /**
   * Read the global config file
   */
  private static async readConfig() {
    try {
      const fmConfig = Settings.projectConfigPath;
      if (fmConfig && existsSync(fmConfig)) {
        const localConfig = readFileSync(fmConfig, 'utf8');
        Settings.globalConfig = jsoncParser.parse(localConfig);
        commands.executeCommand('setContext', CONTEXT.isEnabled, true);
      } else {
        Settings.globalConfig = undefined;
      }

      // Read the files from the config folder
      let configFiles = await workspace.findFiles(`**/${Settings.globalConfigFolder}/**/*.json`);
      if (configFiles.length === 0) {
        Logger.info(`No ".frontmatter/config" config files found.`);
      }

      // Sort the files by fsPath
      configFiles = configFiles.sort((a, b) => a.fsPath.localeCompare(b.fsPath));

      for await (const configFile of configFiles) {
        await Settings.processConfigFile(configFile);
      }
    } catch (e) {
      Settings.globalConfig = undefined;
      Notifications.error(`Error reading "frontmatter.json" config file. Check [output window](command:${COMMAND_NAME.showOutputChannel}) for more details.`);
      Logger.error((e as Error).message);
    }

    Settings.readConfigPromise = undefined;
  }

  /**
   * Process the config file
   * @param configFile 
   * @returns 
   */
  private static async processConfigFile(configFile: Uri) {
    try {
      const config = await workspace.fs.readFile(configFile);
      const configJson = jsoncParser.parse(config.toString());
      
      const filePath = parseWinPath(configFile.fsPath);
      const configFilePath = filePath.split(Settings.globalConfigFolder).pop();
      if (!configFilePath) {
        return;
      }
      Logger.info(`Processing "${configFilePath}" config file.`);

      // Get the path without the filename
      const configFolder = parseWinPath(dirname(configFilePath));
      let relSettingName = configFolder.split('/').join('.');
      if (relSettingName.startsWith('.')) {
        relSettingName = relSettingName.substring(1);
      }
      relSettingName = relSettingName.toLowerCase();

      if (!Settings.globalConfig) {
        Settings.globalConfig = {};
      }

      // Array settings
      if (relSettingName === SETTING_TAXONOMY_CONTENT_TYPES.toLowerCase() ||
          relSettingName === SETTING_CONTENT_PAGE_FOLDERS.toLowerCase() || 
          relSettingName === SETTING_CONTENT_PLACEHOLDERS.toLowerCase() ||
          relSettingName === SETTING_CUSTOM_SCRIPTS.toLowerCase() ||
          relSettingName === SETTING_DATA_FILES.toLowerCase() ||
          relSettingName === SETTING_DATA_FOLDERS.toLowerCase() ||
          relSettingName === SETTING_DATA_TYPES.toLowerCase()) {

        // Get the correct setting name
        let settingNameValue = ""
        if (relSettingName === SETTING_TAXONOMY_CONTENT_TYPES.toLowerCase()) {
          settingNameValue = SETTING_TAXONOMY_CONTENT_TYPES;
        } else if (relSettingName === SETTING_CONTENT_PAGE_FOLDERS.toLowerCase()) {
          settingNameValue = SETTING_CONTENT_PAGE_FOLDERS;
        } else if (relSettingName === SETTING_CONTENT_PLACEHOLDERS.toLowerCase()) {
          settingNameValue = SETTING_CONTENT_PLACEHOLDERS;
        } else if (relSettingName === SETTING_CUSTOM_SCRIPTS.toLowerCase()) {
          settingNameValue = SETTING_CUSTOM_SCRIPTS;
        } else if (relSettingName === SETTING_DATA_FILES.toLowerCase()) {
          settingNameValue = SETTING_DATA_FILES;
        } else if (relSettingName === SETTING_DATA_FOLDERS.toLowerCase()) {
          settingNameValue = SETTING_DATA_FOLDERS;
        } else if (relSettingName === SETTING_DATA_TYPES.toLowerCase()) {
          settingNameValue = SETTING_DATA_TYPES;
        }

        const crntValue = Settings.globalConfig[`${CONFIG_KEY}.${settingNameValue}`] || [];
        Settings.globalConfig[`${CONFIG_KEY}.${settingNameValue}`] = [...crntValue, configJson];
      }
      // Object settings
      else if (relSettingName === SETTING_CONTENT_SNIPPETS.toLowerCase()) {
        // Filename is the key
        const fileName = parse(configFilePath).name;
        const crntValue = Settings.globalConfig[`${CONFIG_KEY}.${SETTING_CONTENT_SNIPPETS}`] || {};
        Settings.globalConfig[`${CONFIG_KEY}.${SETTING_CONTENT_SNIPPETS}`] = { ...crntValue, ...{ [fileName]: configJson } };
      }
    } catch (e) {
      Logger.error(`Error reading config file: ${configFile.fsPath}`);
      Logger.error((e as Error).message);
    }
  }

  /**
   * Create a file creation watcher
   */
  private static createFileCreationWatcher() {
    const ext = Extension.getInstance();

    if (!Settings.fileCreationWatcher) {
      Settings.fileCreationWatcher = workspace.createFileSystemWatcher(`**/*.json`, false, true, true);
      Settings.fileCreationWatcher.onDidCreate(uri => {
        if (parseWinPath(uri.fsPath) === parseWinPath(Settings.projectConfigPath)) {
          Settings.rebindWatchers();
          // Stop listening to file creation events
          Settings.fileCreationWatcher?.dispose();
          Settings.fileCreationWatcher = undefined;
        }
      }, null, ext.subscriptions);
    }
  }

  /**
   * Rebind the configuration watchers
   */
  private static rebindWatchers() {
    Logger.info(`Rebinding ${this.listeners.length} listeners`);
    
    this.listeners.forEach(l => {
      Settings.onConfigChange(l);
      l();
    });
  }
}