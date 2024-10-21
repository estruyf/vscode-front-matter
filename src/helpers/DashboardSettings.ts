import { GitListener } from './../listeners/general/GitListener';
import { basename, join } from 'path';
import { workspace } from 'vscode';
import { Folders } from '../commands/Folders';
import { Project } from '../commands/Project';
import {
  CONTEXT,
  ExtensionState,
  SETTING_CONTENT_DRAFT_FIELD,
  SETTING_CONTENT_FILTERS,
  SETTING_CONTENT_SORTING,
  SETTING_CONTENT_SORTING_DEFAULT,
  SETTING_DASHBOARD_OPENONSTART,
  SETTING_DATA_FILES,
  SETTING_DATA_FOLDERS,
  SETTING_DATA_TYPES,
  SETTING_FRAMEWORK_ID,
  SETTING_MEDIA_SORTING_DEFAULT,
  SETTING_CUSTOM_SCRIPTS,
  SETTING_CONTENT_SNIPPETS,
  SETTING_DATE_FORMAT,
  SETTING_DASHBOARD_CONTENT_TAGS,
  SETTING_MEDIA_SUPPORTED_MIMETYPES,
  SETTING_TAXONOMY_CUSTOM,
  SETTING_TEMPLATES_ENABLED,
  SETTING_GIT_ENABLED,
  SETTING_DASHBOARD_CONTENT_PAGINATION,
  SETTING_SNIPPETS_WRAPPER,
  SETTING_DASHBOARD_CONTENT_CARD_DATE,
  SETTING_DASHBOARD_CONTENT_CARD_TITLE,
  SETTING_DASHBOARD_CONTENT_CARD_STATE,
  SETTING_DASHBOARD_CONTENT_CARD_DESCRIPTION,
  SETTING_WEBSITE_URL,
  SETTING_MEDIA_CONTENTTYPES
} from '../constants';
import {
  DashboardViewType,
  SortingOption,
  Settings as ISettings
} from '../dashboardWebView/models';
import {
  CustomScript,
  DEFAULT_MEDIA_CONTENT_TYPE,
  DraftField,
  FilterType,
  MediaContentType,
  Snippets,
  SortingSetting,
  TaxonomyType
} from '../models';
import { DataFile } from '../models/DataFile';
import { DataFolder } from '../models/DataFolder';
import { DataType } from '../models/DataType';
import { Extension } from './Extension';
import { FrameworkDetector } from './FrameworkDetector';
import { Settings } from './SettingsHelper';
import { parseWinPath } from './parseWinPath';
import { TaxonomyHelper } from './TaxonomyHelper';
import { ContentType } from './ContentType';
import { Logger } from './Logger';
import { DataListener } from '../listeners/dashboard';

export class DashboardSettings {
  private static cachedSettings: ISettings | undefined = undefined;

  public static async get(clear = false) {
    if (!this.cachedSettings || clear) {
      this.cachedSettings = await this.getSettings();
    }

    return this.cachedSettings;
  }

  public static async updateAfterClose() {
    if (this.cachedSettings) {
      this.cachedSettings = await this.getSettings();

      const ext = Extension.getInstance();

      // Update states
      this.cachedSettings.dashboardState.contents.sorting = await ext.getState<
        SortingOption | undefined
      >(ExtensionState.Dashboard.Contents.Sorting, 'workspace');
      this.cachedSettings.dashboardState.media.sorting = await ext.getState<
        SortingOption | undefined
      >(ExtensionState.Dashboard.Media.Sorting, 'workspace');
    }
  }

  public static async getSettings() {
    Logger.verbose('DashboardSettings:getSettings:start');

    try {
      const ext = Extension.getInstance();
      const wsFolder = Folders.getWorkspaceFolder();
      const isInitialized = await Project.isInitialized();
      const pagination = Settings.get<boolean | number>(SETTING_DASHBOARD_CONTENT_PAGINATION);

      const settings = {
        projects: Settings.getProjects(),
        project: Settings.getProject(),
        git: await GitListener.getSettings(),
        beta: ext.isBetaVersion(),
        wsFolder: wsFolder ? wsFolder.fsPath : '',
        staticFolder: Folders.getStaticFolderRelativePath(),
        initialized: isInitialized,
        tags: (await TaxonomyHelper.get(TaxonomyType.Tag)) || [],
        categories: (await TaxonomyHelper.get(TaxonomyType.Category)) || [],
        customTaxonomy: Settings.get(SETTING_TAXONOMY_CUSTOM, true) || [],
        openOnStart: Settings.get(SETTING_DASHBOARD_OPENONSTART),
        versionInfo: ext.getVersion(),
        pageViewType: await ext.getState<DashboardViewType | undefined>(
          ExtensionState.PagesView,
          'workspace'
        ),
        contentTypes: ContentType.getAll() || [],
        draftField: Settings.get<DraftField>(SETTING_CONTENT_DRAFT_FIELD),
        customSorting: Settings.get<SortingSetting[]>(SETTING_CONTENT_SORTING),
        contentFolders: await Folders.get(),
        filters:
          Settings.get<(FilterType | { title: string; name: string })[]>(SETTING_CONTENT_FILTERS),
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
            pagination: pagination !== undefined ? pagination : true,
            cardFields: {
              state: Settings.get<string>(SETTING_DASHBOARD_CONTENT_CARD_STATE),
              date: Settings.get<string>(SETTING_DASHBOARD_CONTENT_CARD_DATE),
              title: Settings.get<string>(SETTING_DASHBOARD_CONTENT_CARD_TITLE),
              description: Settings.get<string>(SETTING_DASHBOARD_CONTENT_CARD_DESCRIPTION)
            }
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
        dataFolders: Settings.get<DataFolder[]>(SETTING_DATA_FOLDERS) || [],
        dataTypes: Settings.get<DataType[]>(SETTING_DATA_TYPES),
        snippets: Settings.get<Snippets>(SETTING_CONTENT_SNIPPETS),
        snippetsWrapper: Settings.get<boolean>(SETTING_SNIPPETS_WRAPPER),
        isBacker: await ext.getState<boolean | undefined>(CONTEXT.backer, 'global'),
        websiteUrl: Settings.get<string>(SETTING_WEBSITE_URL),
        media: {
          contentTypes: Settings.get<MediaContentType[]>(SETTING_MEDIA_CONTENTTYPES) || [
            DEFAULT_MEDIA_CONTENT_TYPE
          ]
        },
        lastUpdated: new Date().getTime()
      } as ISettings;

      Logger.verbose('DashboardSettings:getSettings:end');

      return settings;
    } catch (error) {
      Logger.error(`DashboardSettings:getSettings:error ${(error as Error).message}`);
      return {} as ISettings;
    }
  }

  /**
   * Retrieve all the data files
   * @returns
   */
  private static async getDataFiles(): Promise<DataFile[]> {
    Logger.verbose('DashboardSettings:getDataFiles:start');
    const wsPath = parseWinPath(Folders.getWorkspaceFolder()?.fsPath);
    const files = Settings.get<DataFile[]>(SETTING_DATA_FILES);
    const folders = Settings.get<DataFolder[]>(SETTING_DATA_FOLDERS);

    const clonedFiles = Object.assign([], files);
    if (folders) {
      for (const folder of folders) {
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
        for (const dataFile of dataFiles) {
          clonedFiles.push(DataListener.createDataFileObject(dataFile.fsPath, folder));
        }
      }
    }

    Logger.verbose('DashboardSettings:getDataFiles:end');
    return clonedFiles;
  }
}
