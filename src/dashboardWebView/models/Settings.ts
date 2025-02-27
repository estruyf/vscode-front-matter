import { DataType } from './../../models/DataType';
import { VersionInfo } from '../../models/VersionInfo';
import { ContentFolder } from '../../models/ContentFolder';
import {
  ContentType,
  CustomScript,
  CustomTaxonomy,
  DataFolder,
  DraftField,
  FilterType,
  Framework,
  GitSettings,
  MediaContentType,
  Project,
  Snippets,
  SortingSetting
} from '../../models';
import { SortingOption } from './SortingOption';
import { DashboardViewType } from '.';
import { DataFile } from '../../models/DataFile';

export interface Settings {
  projects: Project[];
  project: Project;
  git: GitSettings | undefined;
  beta: boolean;
  initialized: boolean;
  wsFolder: string;
  staticFolder: string;
  tags: string[];
  categories: string[];
  customTaxonomy: CustomTaxonomy[];
  openOnStart: boolean | null;
  openPanelForSupportedFiles: boolean | null;
  versionInfo: VersionInfo;
  pageViewType: DashboardViewType | undefined;
  contentTypes: ContentType[];
  contentFolders: ContentFolder[];
  crntFramework: string;
  websiteUrl: string;
  framework: Framework | null | undefined;
  draftField: DraftField | null | undefined;
  customSorting: SortingSetting[] | undefined;
  filters: (FilterType | { title: string; name: string })[] | undefined;
  grouping: { title: string; name: string }[] | undefined;
  dashboardState: DashboardState;
  scripts: CustomScript[];
  dataFiles: DataFile[] | undefined;
  dataFolders: DataFolder[];
  dataTypes: DataType[] | undefined;
  isBacker: boolean | undefined;
  snippets: Snippets | undefined;
  snippetsWrapper: boolean;
  date: { format: string };
  lastUpdated: number;
  media: MediaDashboardSettings;
}

export interface MediaDashboardSettings {
  contentTypes: MediaContentType[];
}

export interface DashboardState {
  contents: ContentsViewState;
  media: MediaViewState;
  welcome: WelcomeViewState;
}

export interface ContentsViewState {
  sorting: SortingOption | null | undefined;
  defaultSorting: string | null | undefined;
  tags: string | null | undefined;
  templatesEnabled: boolean | null | undefined;
  pagination: boolean | number | null | undefined;
  cardFields: CardFields;
}

export interface CardFields {
  state: boolean | undefined;
  date: boolean | undefined;
  title: string | null | undefined;
  description: string | null | undefined;
}

export interface MediaViewState extends ContentsViewState {
  selectedFolder: string | null | undefined;
  mimeTypes: string[] | null | undefined;
}

export interface WelcomeViewState {
  contentFolders: string[];
}
