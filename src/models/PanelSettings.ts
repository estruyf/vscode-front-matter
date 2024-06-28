import { FileStat } from 'vscode';
import { ContentFolder, DraftField, GitSettings } from '.';
import { Choice } from './Choice';
import { DashboardData } from './DashboardData';
import { DataType } from './DataType';

export interface PanelSettings {
  git: GitSettings | undefined;
  seo: SEO;
  slug: Slug;
  tags: string[];
  date: DateInfo;
  categories: string[];
  customTaxonomy: CustomTaxonomy[];
  freeform: boolean | undefined;
  scripts: CustomScript[];
  isInitialized: boolean;
  modifiedDateUpdate: boolean;
  writingSettingsEnabled: boolean;
  fmHighlighting: boolean | undefined;
  preview: PreviewSettings;
  contentTypes: ContentType[];
  dashboardViewData: DashboardData | undefined;
  draftField: DraftField | undefined;
  isBacker: boolean | undefined;
  framework: string | undefined;
  commands: FrameworkCommands;
  dataTypes: DataType[] | undefined;
  fieldGroups: FieldGroup[] | undefined;
  commaSeparatedFields: string[];
  aiEnabled: boolean;
  copilotEnabled: boolean;
  contentFolders: ContentFolder[];
  websiteUrl: string;
  disabledActions: PanelAction[];
}

export type PanelAction =
  | 'openDashboard'
  | 'createContent'
  | 'optimizeSlug'
  | 'preview'
  | 'openOnWebsite'
  | 'startStopServer'
  | 'customActions';

export interface FieldGroup {
  id: string;
  labelField?: string;
  fields: Field[];
}

export interface FrameworkCommands {
  start: string | undefined;
}

export interface ContentType {
  name: string;
  fields: Field[];

  fileType?: 'md' | 'mdx' | string;
  previewPath?: string | null;
  trailingSlash?: boolean; // Add this property for trailing slash option
  slugTemplate?: string;
  pageBundle?: boolean;
  defaultFileName?: string;
  template?: string;
  postScript?: string;
  filePrefix?: string;
  clearEmpty?: boolean;
  isSubContent?: boolean;
  allowAsSubContent?: boolean;
}

export type FieldType =
  | 'string'
  | 'number'
  | 'datetime'
  | 'boolean'
  | 'image'
  | 'choice'
  | 'tags'
  | 'categories'
  | 'draft'
  | 'taxonomy'
  | 'fields'
  | 'json'
  | 'block'
  | 'file'
  | 'dataFile'
  | 'list'
  | 'slug'
  | 'divider'
  | 'heading'
  | 'contentRelationship'
  | 'fieldCollection'
  | 'customField';

export interface Field {
  title?: string;
  description?: string;
  name: string;
  type: FieldType;
  choices?: string[] | Choice[];
  single?: boolean;
  wysiwyg?: boolean;
  multiple?: boolean;
  isPreviewImage?: boolean;
  hidden?: boolean;
  taxonomyId?: string;
  default?: string | number | string[] | boolean;
  fields?: Field[];
  fieldGroup?: string | string[];
  dataType?: string | string[];
  taxonomyLimit?: number;
  singleValueAsString?: boolean;
  fileExtensions?: string[];
  editable?: boolean;
  required?: boolean;
  encodeEmoji?: boolean;

  // Date fields
  isPublishDate?: boolean;
  isModifiedDate?: boolean;
  dateFormat?: string;

  // Data file
  dataFileId?: string;
  dataFileKey?: string;
  dataFileValue?: string;

  // Number field options
  numberOptions?: NumberOptions;

  // Content relationship
  contentTypeName?: string;
  contentTypeValue?: 'path' | 'slug';

  // Custom field
  customType?: string;

  // When clause
  when?: WhenClause;

  // Custom action
  action?: CustomScript;
}

export interface NumberOptions {
  isDecimal?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export enum WhenOperator {
  equals = 'eq',
  notEquals = 'neq',
  contains = 'contains',
  notContains = 'notContains',
  startsWith = 'startsWith',
  endsWith = 'endsWith',
  greaterThan = 'gt',
  greaterThanOrEqual = 'gte',
  lessThan = 'lt',
  lessThanOrEqual = 'lte'
}

export interface WhenClause {
  fieldRef: string;
  operator: WhenOperator;
  value: any;
  caseSensitive?: boolean;
}

export interface DateInfo {
  format: string;
}

export interface SEO {
  title: number;
  slug: number;
  description: number;
  content: number;
  titleField: string;
  descriptionField: string;
}

export interface Slug {
  prefix: number | string;
  suffix: number | string;
  updateFileName?: boolean;
}

export interface FolderInfo {
  title: string;
  path: string;
  files: number;
  lastModified: FileInfo[];
  locale?: string;
  localeTitle?: string;
}

export interface FileInfo extends FileStat {
  filePath: string;
  fileName: string;
  folderName: string | undefined;
  folderPath: string;
}

export interface CustomScript {
  id?: string;
  title: string;
  script: string;
  nodeBin?: string;
  bulk?: boolean;
  output?: 'notification' | 'editor';
  outputType?: string;
  type?: ScriptType;
  command?: CommandType | string;
  hidden?: boolean;
  environments?: EnvironmentScript[];
  contentTypes?: string[];
}

export type EnvironmentType = 'windows' | 'macos' | 'linux';

export interface EnvironmentScript {
  type: EnvironmentType;
  script: string;
  command: CommandType | string;
}

export interface PreviewSettings {
  host: string | undefined;
  pathname: string | undefined;
  trailingSlash: boolean | undefined;
}

export interface CustomTaxonomy {
  id: string;
  options: string[];
}

export enum ScriptType {
  Content = 'content',
  MediaFolder = 'mediaFolder',
  MediaFile = 'mediaFile'
}

export enum CommandType {
  Node = 'node',
  Shell = 'shell',
  PowerShell = 'powershell',
  Python = 'python',
  Python3 = 'python3'
}
