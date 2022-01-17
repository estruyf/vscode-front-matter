import { DataType } from './../../models/DataType';
import { VersionInfo } from '../../models/VersionInfo';
import { ContentFolder } from '../../models/ContentFolder';
import { ContentType, CustomScript, DraftField, Framework, SortingSetting } from '../../models';
import { SortingOption } from './SortingOption';
import { DashboardViewType } from '.';
import { DataFile } from '../../models/DataFile';

export interface Settings { 
  beta: boolean;
  initialized: boolean;
  wsFolder: string; 
  staticFolder: string; 
  folders: ContentFolder[]; 
  tags: string[];
  categories: string[];
  openOnStart: boolean | null;
  versionInfo: VersionInfo;
  pageViewType: DashboardViewType | undefined;
  mediaSnippet: string[];
  contentTypes: ContentType[];
  contentFolders: ContentFolder[];
  crntFramework: string;
  framework: Framework | null | undefined;
  draftField: DraftField | null | undefined;
  customSorting: SortingSetting[] | undefined;
  dashboardState: DashboardState;
  scripts: CustomScript[];
  dataFiles: DataFile[] | undefined;
  dataTypes: DataType[] | undefined;
  isBacker: boolean | undefined;
}

export interface DashboardState {
  contents: ViewState;
  media: MediaViewState;
}

export interface ViewState {
  sorting: SortingOption | null | undefined;
  defaultSorting: string | null | undefined;
}

export interface MediaViewState extends ViewState {
  selectedFolder: string | null | undefined;
}