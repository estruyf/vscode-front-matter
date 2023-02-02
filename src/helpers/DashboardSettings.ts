import { GitListener } from './../listeners/general/GitListener';
import { basename, join } from 'path';
import { workspace } from 'vscode';
import { Folders } from '../commands/Folders';
import { Project } from '../commands/Project';
import {
  CONTEXT,
  ExtensionState,
  SETTING_CONTENT_DRAFT_FIELD,
  SETTING_CONTENT_SORTING,
  SETTING_CONTENT_SORTING_DEFAULT,
  SETTING_DASHBOARD_OPENONSTART,
  SETTING_DATA_FILES,
  SETTING_DATA_FOLDERS,
  SETTING_DATA_TYPES,
  SETTING_FRAMEWORK_ID,
  SETTING_MEDIA_SORTING_DEFAULT,
  SETTING_CUSTOM_SCRIPTS,
  SETTING_TAXONOMY_CONTENT_TYPES,
  SETTING_CONTENT_SNIPPETS,
  SETTING_DATE_FORMAT,
  SETTING_DASHBOARD_CONTENT_TAGS,
  SETTING_MEDIA_SUPPORTED_MIMETYPES,
  SETTING_TAXONOMY_CUSTOM,
  SETTING_TEMPLATES_ENABLED,
  SETTING_GIT_ENABLED,
  SETTING_DASHBOARD_CONTENT_PAGINATION
} from '../constants';
import {
  DashboardViewType,
  SortingOption,
  Settings as ISettings
} from '../dashboardWebView/models';
import { CustomScript, DraftField, Snippets, SortingSetting, TaxonomyType } from '../models';
import { DataFile } from '../models/DataFile';
import { DataFolder } from '../models/DataFolder';
import { DataType } from '../models/DataType';
import { Extension } from './Extension';
import { FrameworkDetector } from './FrameworkDetector';
import { Settings } from './SettingsHelper';
import { parseWinPath } from './parseWinPath';

export class DashboardSettings {
  private static cachedSettings: ISettings | undefined = undefined;

  public static async get(clear: boolean = false) {
    if (!this.cachedSettings || clear) {
      this.cachedSettings = await this.getSettings();
    }

    return this.cachedSettings;
  }

  public static async getSettings() {
    const ext = Extension.getInstance();
    const wsFolder = Folders.getWorkspaceFolder();
    const isInitialized = Project.isInitialized();
    const gitActions = Settings.get<boolean>(SETTING_GIT_ENABLED);
    const pagination = Settings.get<boolean | number>(SETTING_DASHBOARD_CONTENT_PAGINATION);

    const settings = {
      git: {
        isGitRepo: gitActions ? await GitListener.isGitRepository() : false,
        actions: gitActions || false
      },
      beta: ext.isBetaVersion(),
      wsFolder: wsFolder ? wsFolder.fsPath : '',
      staticFolder: Folders.getStaticFolderRelativePath(),
      initialized: isInitialized,
      tags: Settings.getTaxonomy(TaxonomyType.Tag),
      categories: Settings.getTaxonomy(TaxonomyType.Category),
      customTaxonomy: Settings.get(SETTING_TAXONOMY_CUSTOM, true) || [],
      openOnStart: Settings.get(SETTING_DASHBOARD_OPENONSTART),
      versionInfo: ext.getVersion(),
      pageViewType: await ext.getState<DashboardViewType | undefined>(
        ExtensionState.PagesView,
        'workspace'
      ),
      contentTypes: Settings.get(SETTING_TAXONOMY_CONTENT_TYPES) || [],
      draftField: Settings.get<DraftField>(SETTING_CONTENT_DRAFT_FIELD),
      customSorting: Settings.get<SortingSetting[]>(SETTING_CONTENT_SORTING),
      contentFolders: Folders.get(),
      crntFramework: Settings.get<string>(SETTING_FRAMEWORK_ID),
      framework: !isInitialized && wsFolder ? await FrameworkDetector.get(wsFolder.fsPath) : null,
      scripts: Settings.get<CustomScript[]>(SETTING_CUSTOM_SCRIPTS) || [],
      date: {
        format: Settings.get<string>(SETTING_DATE_FORMAT) || ''
      },
      dashboardState: {
        contents: {
          sorting: await ext.getState<SortingOption | undefined>(
            ExtensionState.Dashboard.Contents.Sorting,
            'workspace'
          ),
          defaultSorting: Settings.get<string>(SETTING_CONTENT_SORTING_DEFAULT),
          tags: Settings.get<string>(SETTING_DASHBOARD_CONTENT_TAGS),
          templatesEnabled: Settings.get<boolean>(SETTING_TEMPLATES_ENABLED),
          pagination: pagination !== undefined ? pagination : true
        },
        media: {
          sorting: await ext.getState<SortingOption | undefined>(
            ExtensionState.Dashboard.Media.Sorting,
            'workspace'
          ),
          defaultSorting: Settings.get<string>(SETTING_MEDIA_SORTING_DEFAULT),
          selectedFolder: await ext.getState<string | undefined>(
            ExtensionState.SelectedFolder,
            'workspace'
          ),
          mimeTypes: Settings.get<string[]>(SETTING_MEDIA_SUPPORTED_MIMETYPES)
        },
        welcome: {
          contentFolders: await Folders.getContentFolders()
        }
      },
      dataFiles: await this.getDataFiles(),
      dataTypes: Settings.get<DataType[]>(SETTING_DATA_TYPES),
      snippets: Settings.get<Snippets>(SETTING_CONTENT_SNIPPETS),
      isBacker: await ext.getState<boolean | undefined>(CONTEXT.backer, 'global')
    } as ISettings;

    return settings;
  }

  /**
   * Retrieve all the data files
   * @returns
   */
  private static async getDataFiles(): Promise<DataFile[]> {
    const wsPath = parseWinPath(Folders.getWorkspaceFolder()?.fsPath);
    const files = Settings.get<DataFile[]>(SETTING_DATA_FILES);
    const folders = Settings.get<DataFolder[]>(SETTING_DATA_FOLDERS);

    let clonedFiles = Object.assign([], files);
    if (folders) {
      for (let folder of folders) {
        if (!folder.path) {
          continue;
        }

        const folderPath = Folders.getAbsFilePath(folder.path);
        if (!folderPath) {
          continue;
        }

        let dataFolderPath = parseWinPath(join(folderPath.replace(wsPath || '', '')));
        if (dataFolderPath.startsWith('/')) {
          dataFolderPath = dataFolderPath.substring(1);
        }

        const dataJsonFiles = await workspace.findFiles(
          parseWinPath(join(dataFolderPath, '*.json'))
        );
        const dataYmlFiles = await workspace.findFiles(parseWinPath(join(dataFolderPath, '*.yml')));
        const dataYamlFiles = await workspace.findFiles(
          parseWinPath(join(dataFolderPath, '*.yaml'))
        );

        const dataFiles = [...dataJsonFiles, ...dataYmlFiles, ...dataYamlFiles];
        for (let dataFile of dataFiles) {
          clonedFiles.push({
            id: basename(dataFile.fsPath),
            title: basename(dataFile.fsPath),
            file: dataFile.fsPath,
            fileType: dataFile.fsPath.endsWith('.json') ? 'json' : 'yaml',
            labelField: folder.labelField,
            schema: folder.schema,
            type: folder.type,
            singleEntry: typeof folder.singleEntry === 'boolean' ? folder.singleEntry : false
          } as DataFile);
        }
      }
    }

    return clonedFiles;
  }
}
