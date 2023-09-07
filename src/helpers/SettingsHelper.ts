import { SETTING_PROJECTS } from './../constants/settings';
import { parseWinPath } from './parseWinPath';
import { Telemetry } from './Telemetry';
import { Notifications } from './Notifications';
import { commands, Uri, workspace, window } from 'vscode';
import * as vscode from 'vscode';
import { ContentType, CustomTaxonomy, Project } from '../models';
import {
  SETTING_TAXONOMY_TAGS,
  SETTING_TAXONOMY_CATEGORIES,
  CONFIG_KEY,
  CONTEXT,
  ExtensionState,
  SETTING_TAXONOMY_CUSTOM,
  TelemetryEvent,
  COMMAND_NAME,
  SETTING_TAXONOMY_CONTENT_TYPES,
  SETTING_CONTENT_PAGE_FOLDERS,
  SETTING_CONTENT_SNIPPETS,
  SETTING_CONTENT_PLACEHOLDERS,
  SETTING_CUSTOM_SCRIPTS,
  SETTING_DATA_FILES,
  SETTING_DATA_TYPES,
  SETTING_DATA_FOLDERS,
  SETTING_EXTENDS,
  SETTING_CONTENT_SORTING,
  SETTING_GLOBAL_MODES,
  SETTING_TAXONOMY_FIELD_GROUPS,
  SETTING_CONTENT_DRAFT_FIELD,
  SETTING_CONTENT_SUPPORTED_FILETYPES,
  SETTING_GLOBAL_NOTIFICATIONS,
  SETTING_GLOBAL_NOTIFICATIONS_DISABLED,
  SETTING_MEDIA_SUPPORTED_MIMETYPES,
  SETTING_COMMA_SEPARATED_FIELDS,
  SETTING_REMOVE_QUOTES
} from '../constants';
import { Folders } from '../commands/Folders';
import { join, basename, dirname, parse } from 'path';
import { existsSync } from 'fs';
import { Extension } from './Extension';
import { debounceCallback } from './DebounceCallback';
import { Logger } from './Logger';
import * as jsoncParser from 'jsonc-parser';
import { existsAsync, fetchWithTimeout, readFileAsync, writeFileAsync } from '../utils';
import { Cache, Preview } from '../commands';
import { GitListener } from '../listeners/general';
import { DataListener } from '../listeners/panel';
import { MarkdownFoldingProvider } from '../providers/MarkdownFoldingProvider';
import { ModeSwitch } from '../services/ModeSwitch';

export class Settings {
  public static globalFile = 'frontmatter.json';
  public static globalConfigFolder = '.frontmatter/config';
  public static globalConfig: any;
  private static config: vscode.WorkspaceConfiguration;
  private static isInitialized: boolean = false;
  private static listeners: { id: string; callback: (global?: any) => void }[] = [];
  private static fileCreationWatcher: vscode.FileSystemWatcher | undefined;
  private static fileChangeWatcher: vscode.FileSystemWatcher | undefined;
  private static fileSaveListener: vscode.Disposable;
  private static fileDeleteListener: vscode.Disposable;
  private static readConfigPromise: Promise<void> | undefined = undefined;
  private static project: Project | undefined = undefined;

  public static async init() {
    await Settings.readConfig();

    const projects = Settings.getProjects();
    const crntProject = await Extension.getInstance().getState<string | undefined>(
      ExtensionState.Project.current,
      'workspace'
    );

    if (projects.length > 0) {
      // Get the default project
      const defaultProject = projects.find((p) => {
        if (crntProject) {
          return p.name === crntProject;
        }
        return p.default;
      });
      if (defaultProject) {
        Settings.project = defaultProject;
      } else {
        Settings.project = projects[0];
      }
    }

    Settings.listeners = [];

    if (!Settings.isInitialized) {
      Settings.isInitialized = true;

      commands.registerCommand(COMMAND_NAME.reloadConfig, Settings.rebindWatchers);
    }

    Settings.config = vscode.workspace.getConfiguration(CONFIG_KEY);

    Settings.attachListener('settings-init', async () => {
      Settings.config = vscode.workspace.getConfiguration(CONFIG_KEY);
    });

    Settings.onConfigChange();
  }

  /**
   * Start listening to changes
   */
  public static startListening() {
    // Things to do when configuration changes
    Settings.attachListener('settings-global', () => {
      Preview.init();
      GitListener.init();

      DataListener.getFoldersAndFiles();
      MarkdownFoldingProvider.triggerHighlighting(true);
      ModeSwitch.register();
    });
  }

  /**
   * Get the current project
   * @returns
   */
  public static getProject() {
    return Settings.project;
  }

  /**
   * Set the project
   * @param value
   */
  public static setProject(value: string) {
    Extension.getInstance().setState(ExtensionState.Project.current, value, 'workspace');
    Settings.project = Settings.getProjects().find((p) => p.name === value);
  }

  /**
   * Fetch all the projects
   * @returns
   */
  public static getProjects(): Project[] {
    const settingKey = `${CONFIG_KEY}.${SETTING_PROJECTS}`;

    let projects = [];
    if (Settings.globalConfig && typeof Settings.globalConfig[settingKey] !== 'undefined') {
      projects = Settings.globalConfig[settingKey];
    }

    if (projects.length > 0) {
      commands.executeCommand('setContext', CONTEXT.projectSwitchEnabled, true);
    } else {
      commands.executeCommand('setContext', CONTEXT.projectSwitchEnabled, false);
    }

    return projects;
  }

  /**
   * Check if the setting is present in the workspace and ask to promote them to the global settings
   */
  public static async checkToPromote() {
    const isPromoted = await Extension.getInstance().getState<boolean | undefined>(
      ExtensionState.SettingPromoted,
      'workspace'
    );
    if (!isPromoted) {
      if (Settings.hasSettings()) {
        window
          .showInformationMessage(
            `You have local settings. Would you like to promote them to the global settings ("frontmatter.json")?`,
            'Yes',
            'No'
          )
          .then(async (result) => {
            if (result === 'Yes') {
              Settings.promote();
            }

            if (result === 'No' || result === 'Yes') {
              Extension.getInstance().setState(ExtensionState.SettingPromoted, true, 'workspace');
            }
          });
      }
    }
  }

  /**
   * Attach a new listener for the setting changes
   * @param id
   * @param callback
   * @returns
   */
  public static attachListener(id: string, callback: (global?: any) => void) {
    const listener = Settings.listeners.find((l) => l.id === id);
    if (listener) {
      listener.callback = callback;
      return;
    }

    Settings.listeners.push({
      id,
      callback
    });
  }

  /**
   * Trigger all the listeners
   */
  public static triggerListeners() {
    for (const listener of Settings.listeners) {
      Logger.info(`Triggering listener: ${listener.id}`);
      listener.callback();
    }
  }

  /**
   * Check for config changes on global and local settings
   * @param callback
   */
  public static onConfigChange() {
    const projectConfig = Settings.projectConfigPath;
    const configDebouncer = debounceCallback();

    workspace.onDidChangeConfiguration(() => {
      Settings.triggerListeners();
    });

    if (projectConfig && !existsSync(projectConfig)) {
      // No config file, no need to watch
      Settings.createFileCreationWatcher();
      return;
    }

    // Background listener for when it is not a user interaction
    if (projectConfig && existsSync(projectConfig)) {
      if (Settings.fileChangeWatcher) {
        Settings.fileChangeWatcher.dispose();
      }

      Settings.fileChangeWatcher = workspace.createFileSystemWatcher(
        projectConfig,
        true,
        false,
        true
      );
      Settings.fileChangeWatcher.onDidChange(async () => {
        Logger.info(`Config change detected - ${projectConfig} changed`);
        configDebouncer(() => Settings.triggerListeners(), 200);
      });
    }

    const reloadConfig = async (debounced: boolean = true) => {
      Logger.info(`Reloading config...`);
      if (Settings.readConfigPromise === undefined) {
        Settings.readConfigPromise = Settings.readConfig();
      }
      await Settings.readConfigPromise;

      Logger.info(`Reloaded config...`);
      if (debounced) {
        configDebouncer(() => Settings.triggerListeners(), 200);
      } else {
        Settings.triggerListeners();
      }
    };

    if (Settings.fileSaveListener) {
      Settings.fileSaveListener.dispose();
    }

    Settings.fileSaveListener = workspace.onDidSaveTextDocument(async (e) => {
      const filename = e.uri.fsPath;

      if (Settings.checkProjectConfig(filename)) {
        Logger.info(`Config change detected - ${filename} saved`);
        await reloadConfig();
      }
    });

    if (Settings.fileDeleteListener) {
      Settings.fileDeleteListener.dispose();
    }

    Settings.fileDeleteListener = workspace.onDidDeleteFiles(async (e) => {
      const needCallback = e?.files.find((f) => Settings.checkProjectConfig(f.fsPath));
      if (needCallback) {
        await reloadConfig(false);
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
    const teamValue =
      Settings.globalConfig && typeof Settings.globalConfig[settingKey] !== 'undefined'
        ? Settings.globalConfig[settingKey]
        : undefined;

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

    if (Settings.project) {
      if (
        typeof Settings.project.configuration !== 'undefined' &&
        typeof Settings.project.configuration[settingKey] !== 'undefined'
      ) {
        setting = Settings.project.configuration[settingKey];
        return setting;
      }
    }

    if (Settings.globalConfig && typeof Settings.globalConfig[settingKey] !== 'undefined') {
      setting = Settings.globalConfig[settingKey];
    }

    // Local overrides global
    if (configInpection && typeof configInpection.workspaceValue !== 'undefined') {
      if (merging && setting && typeof setting === 'object') {
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
      if (fmConfig && (await existsAsync(fmConfig))) {
        const localConfig = await readFileAsync(fmConfig, 'utf8');
        Settings.globalConfig = jsoncParser.parse(localConfig);
        Settings.globalConfig[`${CONFIG_KEY}.${name}`] = value;

        const content = JSON.stringify(Settings.globalConfig, null, 2);
        await writeFileAsync(fmConfig, content, 'utf8');

        const workspaceSettingValue = Settings.hasWorkspaceSettings<ContentType[]>(name);
        if (workspaceSettingValue) {
          await Settings.update(name, undefined);
        }

        // Make sure to reload the whole config + all the data files
        await Settings.readConfig();

        return;
      }
    } else {
      await Settings.config.update(name, value);
      return;
    }

    // Fallback to the local settings
    await Settings.config.update(name, value);
  }

  public static async remove(name: string) {
    const fmConfig = Settings.projectConfigPath;

    if (fmConfig && (await existsAsync(fmConfig))) {
      const localConfig = await readFileAsync(fmConfig, 'utf8');
      Settings.globalConfig = jsoncParser.parse(localConfig);
      delete Settings.globalConfig[`${CONFIG_KEY}.${name}`];

      const content = JSON.stringify(Settings.globalConfig, null, 2);
      await writeFileAsync(fmConfig, content, 'utf8');

      const workspaceSettingValue = Settings.hasWorkspaceSettings<ContentType[]>(name);
      if (workspaceSettingValue) {
        await Settings.update(name, undefined);
      }

      // Make sure to reload the whole config + all the data files
      await Settings.readConfig();

      return;
    }

    await Settings.config.update(name, undefined);
  }

  /**
   * Checks if the project contains the frontmatter.json file
   */
  public static hasProjectFile() {
    const wsFolder = Folders.getWorkspaceFolder();
    const configPath = join(wsFolder?.fsPath || '', Settings.globalFile);
    return existsSync(configPath);
  }

  /**
   * Create team settings
   */
  public static async createTeamSettings() {
    const wsFolder = Folders.getWorkspaceFolder();
    await this.createGlobalFile(wsFolder);
  }

  /**
   * Create the frontmatter.json file
   * @param wsFolder
   */
  public static async createGlobalFile(wsFolder: Uri | undefined | null) {
    const initialConfig = {
      $schema: `https://${
        Extension.getInstance().isBetaVersion() ? `beta.` : ``
      }frontmatter.codes/frontmatter.schema.json`
    };

    if (wsFolder) {
      const configPath = join(wsFolder.fsPath, Settings.globalFile);
      if (!(await existsAsync(configPath))) {
        await writeFileAsync(configPath, JSON.stringify(initialConfig, null, 2), 'utf8');
      }
    }
  }

  /**
   * Return the taxonomy settings
   *
   * @param type
   */
  public static getCustomTaxonomy(type: string): string[] {
    const customTaxs = Settings.get<CustomTaxonomy[]>(SETTING_TAXONOMY_CUSTOM, true);
    if (customTaxs && customTaxs.length > 0) {
      return customTaxs.find((t) => t.id === type)?.options || [];
    }
    return [];
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
    let taxIdx = customTaxonomies?.findIndex((o) => o.id === id);

    if (taxIdx === -1) {
      customTaxonomies.push({
        id,
        options: []
      } as CustomTaxonomy);

      taxIdx = customTaxonomies?.findIndex((o) => o.id === id);
    }

    customTaxonomies[taxIdx].options.push(option);
    customTaxonomies[taxIdx].options = [...new Set(customTaxonomies[taxIdx].options)];
    customTaxonomies[taxIdx].options = customTaxonomies[taxIdx].options.sort().filter((o) => !!o);
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
    let taxIdx = customTaxonomies?.findIndex((o) => o.id === id);

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

        if (setting && typeof setting.workspaceValue !== 'undefined') {
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
    return setting && typeof setting.workspaceValue !== 'undefined'
      ? setting.workspaceValue
      : undefined;
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

        if (setting && typeof setting.workspaceValue !== 'undefined') {
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
      return (
        filePath &&
        basename(filePath).toLowerCase() === Settings.globalFile.toLowerCase() &&
        fmConfig.toLowerCase() === filePath.toLowerCase()
      );
    }

    return false;
  }

  /**
   * Read the global config file
   */
  private static async readConfig() {
    try {
      const fmConfig = Settings.projectConfigPath;
      if (fmConfig && (await existsAsync(fmConfig))) {
        const localConfig = await readFileAsync(fmConfig, 'utf8');
        Settings.globalConfig = jsoncParser.parse(localConfig);
        commands.executeCommand('setContext', CONTEXT.isEnabled, true);
      } else {
        Settings.globalConfig = undefined;
      }

      // Check if the config got external configs
      await Settings.processExternalConfig();

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
      Notifications.error(
        `Error reading "frontmatter.json" config file. Check [output window](command:${COMMAND_NAME.showOutputChannel}) for more details.`
      );
      Logger.error((e as Error).message);
    }

    Settings.readConfigPromise = undefined;
  }

  /**
   * Process the external configs
   */
  private static async processExternalConfig() {
    const extendsConfigName = `${CONFIG_KEY}.${SETTING_EXTENDS}`;
    if (!Settings.globalConfig || !Settings.globalConfig[extendsConfigName]) {
      return;
    }

    const originalConfig = Object.assign({}, Settings.globalConfig);
    const extendsConfig: string[] = Settings.globalConfig[extendsConfigName];
    for (const externalConfig of extendsConfig) {
      if (externalConfig.endsWith(`.json`)) {
        const config = await Settings.getExternalConfig(externalConfig);
        await Settings.extendConfig(config, originalConfig);
      }
    }
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

      Settings.updateGlobalConfigSetting(relSettingName, configJson, configFilePath, filePath);
    } catch (e) {
      Logger.error(`Error reading config file: ${configFile.fsPath}`);
      Logger.error((e as Error).message);
    }
  }

  /**
   * Extend the config with external config data
   * @param config
   * @param originalConfig The original config data is used to make sure we don't override settings coming from the fontmatter.json file.
   * @returns
   */
  private static async extendConfig(config: any, originalConfig: any) {
    if (!config) {
      return;
    }

    // We need to loop through the config to make sure the objects and arrays are merged
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        const value = config[key];
        const settingName = key.replace(`${CONFIG_KEY}.`, '');

        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          if (typeof originalConfig[key] === 'undefined') {
            Settings.globalConfig[key] = value;
          }
        }
        // Objects and arrays to override
        else if (
          settingName === SETTING_CONTENT_DRAFT_FIELD ||
          settingName === SETTING_CONTENT_SUPPORTED_FILETYPES ||
          settingName === SETTING_GLOBAL_NOTIFICATIONS ||
          settingName === SETTING_GLOBAL_NOTIFICATIONS_DISABLED ||
          settingName === SETTING_MEDIA_SUPPORTED_MIMETYPES ||
          settingName === SETTING_COMMA_SEPARATED_FIELDS
        ) {
          if (typeof originalConfig[key] === 'undefined') {
            Settings.globalConfig[key] = value;
          }
        } else if (typeof value === 'object' && value !== null) {
          // Check if array
          if (Array.isArray(value)) {
            if (
              settingName === SETTING_TAXONOMY_CATEGORIES ||
              settingName === SETTING_TAXONOMY_TAGS ||
              settingName === SETTING_REMOVE_QUOTES
            ) {
              // Merge the arrays
              Settings.globalConfig[key] = [
                ...(Settings.globalConfig[key] || []),
                ...(originalConfig[key] || []),
                ...value
              ];
              // Filter out the doubles
              Settings.globalConfig[key] = Settings.globalConfig[key].filter(
                (item: any, index: number) => {
                  return Settings.globalConfig[key].indexOf(item) === index;
                },
                Settings.globalConfig[key]
              );
            } else {
              for (const item of value) {
                Settings.updateGlobalConfigSetting(settingName, item);
              }
            }
          } else if (settingName === SETTING_CONTENT_SNIPPETS) {
            for (const itemKey in value) {
              const crntValue = Settings.globalConfig[key] || {};

              if (!crntValue[itemKey]) {
                Settings.globalConfig[key] = {
                  ...crntValue,
                  ...{ [itemKey]: value[itemKey] }
                };
              }
            }
          }
        }
      }
    }
  }

  /**
   * Update the global config array/object settings
   * @param relSettingName
   * @param configJson
   */
  private static updateGlobalConfigSetting<T>(
    relSettingName: string,
    configJson: any,
    configFilePath?: string,
    filePath?: string
  ): void {
    // Custom scripts
    if (Settings.isEqualOrStartsWith(relSettingName, SETTING_CUSTOM_SCRIPTS)) {
      // const crntValue = Settings.globalConfig[`${CONFIG_KEY}.${SETTING_CUSTOM_SCRIPTS}`] || [];
      // Settings.globalConfig[`${CONFIG_KEY}.${SETTING_CUSTOM_SCRIPTS}`] = [...crntValue, configJson];
      Settings.updateGlobalConfigArraySetting(SETTING_CUSTOM_SCRIPTS, 'id', configJson, 'script');
    }
    // Content types
    else if (Settings.isEqualOrStartsWith(relSettingName, SETTING_TAXONOMY_CONTENT_TYPES)) {
      Settings.updateGlobalConfigArraySetting(SETTING_TAXONOMY_CONTENT_TYPES, 'name', configJson);
    }
    // Data files
    else if (Settings.isEqualOrStartsWith(relSettingName, SETTING_DATA_FILES)) {
      Settings.updateGlobalConfigArraySetting(SETTING_DATA_FILES, 'id', configJson);
    }
    // Data folders
    else if (Settings.isEqualOrStartsWith(relSettingName, SETTING_DATA_FOLDERS)) {
      Settings.updateGlobalConfigArraySetting(SETTING_DATA_FOLDERS, 'id', configJson);
    }
    // Data types
    else if (Settings.isEqualOrStartsWith(relSettingName, SETTING_DATA_TYPES)) {
      Settings.updateGlobalConfigArraySetting(SETTING_DATA_TYPES, 'id', configJson);
    }
    // Page folders
    else if (Settings.isEqualOrStartsWith(relSettingName, SETTING_CONTENT_PAGE_FOLDERS)) {
      Settings.updateGlobalConfigArraySetting(SETTING_CONTENT_PAGE_FOLDERS, 'path', {
        ...configJson,
        extended: true
      });
    }
    // Placeholders
    else if (Settings.isEqualOrStartsWith(relSettingName, SETTING_CONTENT_PLACEHOLDERS)) {
      Settings.updateGlobalConfigArraySetting(SETTING_CONTENT_PLACEHOLDERS, 'id', configJson);
    }
    // Sorting
    else if (Settings.isEqualOrStartsWith(relSettingName, SETTING_CONTENT_SORTING)) {
      Settings.updateGlobalConfigArraySetting(SETTING_CONTENT_SORTING, 'id', configJson);
    }
    // Modes
    else if (Settings.isEqualOrStartsWith(relSettingName, SETTING_GLOBAL_MODES)) {
      Settings.updateGlobalConfigArraySetting(SETTING_GLOBAL_MODES, 'id', configJson);
    }
    // Field groups
    else if (Settings.isEqualOrStartsWith(relSettingName, SETTING_TAXONOMY_FIELD_GROUPS)) {
      Settings.updateGlobalConfigArraySetting(SETTING_TAXONOMY_FIELD_GROUPS, 'id', configJson);
    }
    // Custom taxonomy
    else if (Settings.isEqualOrStartsWith(relSettingName, SETTING_TAXONOMY_CUSTOM)) {
      Settings.updateGlobalConfigArraySetting(SETTING_TAXONOMY_CUSTOM, 'id', configJson);
    }
    // Projects
    else if (Settings.isEqualOrStartsWith(relSettingName, SETTING_PROJECTS)) {
      Settings.updateGlobalConfigArraySetting(SETTING_PROJECTS, 'name', configJson);
    }
    // Snippets
    else if (
      Settings.isEqualOrStartsWith(relSettingName, SETTING_CONTENT_SNIPPETS) &&
      configFilePath &&
      filePath
    ) {
      Settings.updateGlobalConfigObjectByNameSetting(
        SETTING_CONTENT_SNIPPETS,
        configFilePath,
        configJson,
        filePath
      );
    } else if (typeof configJson === 'string') {
      Settings.mergeStringArray(`${CONFIG_KEY}.${relSettingName}`, configJson);
    }
  }

  /**
   * Merge the array setting in the global config
   * @param key
   * @param value
   */
  private static mergeStringArray(key: string, value: string) {
    // Merge the arrays
    Settings.globalConfig[key] = [...(Settings.globalConfig[key] || []), value];
    Settings.globalConfig[key] = Settings.globalConfig[key].filter((item: any, index: number) => {
      return Settings.globalConfig[key].indexOf(item) === index;
    }, Settings.globalConfig[key]);
  }

  /**
   * Check if the setting name is equal or starts with the reference setting name
   * @param value
   * @param startsWith
   * @returns
   */
  private static isEqualOrStartsWith(value: string, startsWith: string) {
    value = value.toLowerCase();
    startsWith = startsWith.toLowerCase();

    return value === startsWith || value.startsWith(`${startsWith}.`);
  }

  /**
   * Update an array setting in the global config
   * @param settingName
   * @param fieldName
   * @param configJson
   */
  private static updateGlobalConfigArraySetting<T>(
    settingName: string,
    fieldName: string,
    configJson: any,
    fallbackFieldName?: string
  ): void {
    const crntValue: T[] = Settings.globalConfig[`${CONFIG_KEY}.${settingName}`] || [];

    const itemIdx = crntValue.findIndex((item: any) => {
      if (typeof item[fieldName] !== 'undefined') {
        return item[fieldName] === configJson[fieldName];
      } else if (fallbackFieldName && typeof item[fallbackFieldName] !== 'undefined') {
        return item[fallbackFieldName] === configJson[fallbackFieldName];
      } else {
        return false;
      }
    });
    if (itemIdx === -1) {
      crntValue.push(configJson);
    }

    Settings.globalConfig[`${CONFIG_KEY}.${settingName}`] = [...crntValue];
  }

  /**
   * Update an object by the file name in the global config
   * @param settingName
   * @param fileNamepath
   * @param configJson
   */
  private static updateGlobalConfigObjectByNameSetting<T>(
    settingName: string,
    fileNamepath: string,
    configJson: any,
    absPath: string
  ): void {
    const crntValue = Settings.globalConfig[`${CONFIG_KEY}.${settingName}`] || {};

    // Filename is the key
    const fileName = parse(fileNamepath).name;

    configJson = {
      ...configJson,
      sourcePath: absPath
    };

    if (!crntValue[fileName]) {
      crntValue[fileName] = configJson;

      Settings.globalConfig[`${CONFIG_KEY}.${settingName}`] = {
        ...crntValue,
        ...{ [fileName]: configJson }
      };
    }
  }

  /**
   * Create a file creation watcher
   */
  private static createFileCreationWatcher() {
    const ext = Extension.getInstance();

    if (!Settings.fileCreationWatcher) {
      Settings.fileCreationWatcher = workspace.createFileSystemWatcher(
        `**/*.json`,
        false,
        true,
        true
      );
      Settings.fileCreationWatcher.onDidCreate(
        (uri) => {
          if (parseWinPath(uri.fsPath) === parseWinPath(Settings.projectConfigPath)) {
            Settings.onConfigChange();
            Settings.rebindWatchers();
            // Stop listening to file creation events
            Settings.fileCreationWatcher?.dispose();
            Settings.fileCreationWatcher = undefined;
          }
        },
        null,
        ext.subscriptions
      );
    }
  }

  /**
   * Rebind the configuration watchers
   */
  private static rebindWatchers() {
    Logger.info(`Rebinding ${this.listeners.length} listeners`);

    Settings.listeners.forEach((l) => {
      Settings.attachListener(l.id, l.callback);
    });

    Settings.triggerListeners();
  }

  /**
   * Retrieve the external configuration
   * @param configPath
   * @returns
   */
  private static async getExternalConfig(configPath: string): Promise<any> {
    let config: any = undefined;

    if (configPath.startsWith('https://')) {
      try {
        let cachedResponse = await Cache.get<{
          [config: string]: { expires: number; data: any };
        }>(ExtensionState.Settings.Extends, 'workspace');

        if (
          cachedResponse &&
          cachedResponse[configPath] &&
          cachedResponse[configPath].expires > new Date().getTime()
        ) {
          config = cachedResponse[configPath].data;
        } else {
          const response = await fetchWithTimeout(configPath, { method: 'GET' });
          if (response.ok) {
            config = await response.json();

            if (!cachedResponse) {
              cachedResponse = {};
            }

            cachedResponse[configPath] = {
              expires: new Date(new Date().getTime() + 1000 * 60 * 10).getTime(),
              data: config
            };

            await Cache.set(ExtensionState.Settings.Extends, cachedResponse, 'workspace');
          }
        }
      } catch (e) {
        Logger.error(`Error fetching external config "${configPath}".`);
      }
    } else {
      const absConfigPath = join(Folders.getWorkspaceFolder()?.fsPath || '', configPath);
      if (await existsAsync(absConfigPath)) {
        const configTxt = await readFileAsync(absConfigPath, 'utf8');
        config = jsoncParser.parse(configTxt);
      } else {
        Logger.error(`External config "${configPath}" not found.`);
      }
    }

    return config;
  }
}
