import { Folders } from "../commands/Folders";
import { Template } from "../commands/Template";
import { ExtensionState, SETTINGS_CONTENT_DRAFT_FIELD, SETTINGS_CONTENT_SORTING, SETTINGS_CONTENT_SORTING_DEFAULT, SETTINGS_CONTENT_STATIC_FOLDER, SETTINGS_DASHBOARD_MEDIA_SNIPPET, SETTINGS_DASHBOARD_OPENONSTART, SETTINGS_DATA_FILES, SETTINGS_DATA_TYPES, SETTINGS_FRAMEWORK_ID, SETTINGS_MEDIA_SORTING_DEFAULT, SETTING_CUSTOM_SCRIPTS, SETTING_TAXONOMY_CONTENT_TYPES } from "../constants";
import { DashboardViewType, SortingOption, Settings as ISettings } from "../dashboardWebView/models";
import { CustomScript, DraftField, ScriptType, SortingSetting, TaxonomyType } from "../models";
import { DataFile } from "../models/DataFile";
import { DataType } from "../models/DataType";
import { Extension } from "./Extension";
import { FrameworkDetector } from "./FrameworkDetector";
import { Settings } from "./SettingsHelper";


export class DashboardSettings {

  public static async get() {
    const ext = Extension.getInstance();
    const wsFolder = Folders.getWorkspaceFolder();
    const isInitialized = await Template.isInitialized();
    
    return {
      beta: ext.isBetaVersion(),
      wsFolder: wsFolder ? wsFolder.fsPath : '',
      staticFolder: Settings.get<string>(SETTINGS_CONTENT_STATIC_FOLDER),
      folders: Folders.get(),
      initialized: isInitialized,
      tags: Settings.getTaxonomy(TaxonomyType.Tag),
      categories: Settings.getTaxonomy(TaxonomyType.Category),
      openOnStart: Settings.get(SETTINGS_DASHBOARD_OPENONSTART),
      versionInfo: ext.getVersion(),
      pageViewType: await ext.getState<DashboardViewType | undefined>(ExtensionState.PagesView, "workspace"),
      mediaSnippet: Settings.get<string[]>(SETTINGS_DASHBOARD_MEDIA_SNIPPET) || [],
      contentTypes: Settings.get(SETTING_TAXONOMY_CONTENT_TYPES) || [],
      draftField: Settings.get<DraftField>(SETTINGS_CONTENT_DRAFT_FIELD),
      customSorting: Settings.get<SortingSetting[]>(SETTINGS_CONTENT_SORTING),
      contentFolders: Folders.get(),
      crntFramework: Settings.get<string>(SETTINGS_FRAMEWORK_ID),
      framework: (!isInitialized && wsFolder) ? FrameworkDetector.get(wsFolder.fsPath) : null,
      scripts: (Settings.get<CustomScript[]>(SETTING_CUSTOM_SCRIPTS) || []),
      dashboardState: {
        contents: {
          sorting: await ext.getState<SortingOption | undefined>(ExtensionState.Dashboard.Contents.Sorting, "workspace"),
          defaultSorting: Settings.get<string>(SETTINGS_CONTENT_SORTING_DEFAULT)
        },
        media: {
          sorting: await ext.getState<SortingOption | undefined>(ExtensionState.Dashboard.Media.Sorting, "workspace"),
          defaultSorting: Settings.get<string>(SETTINGS_MEDIA_SORTING_DEFAULT),
          selectedFolder: await ext.getState<string | undefined>(ExtensionState.SelectedFolder, "workspace")
        }
      },
      dataFiles: Settings.get<DataFile[]>(SETTINGS_DATA_FILES),
      dataTypes: Settings.get<DataType[]>(SETTINGS_DATA_TYPES)
    } as ISettings
  }
}