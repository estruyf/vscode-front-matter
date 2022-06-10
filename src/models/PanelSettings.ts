import { FileStat } from "vscode";
import { DraftField } from ".";
import { Choice } from "./Choice";
import { DashboardData } from "./DashboardData";
import { DataType } from "./DataType";

export interface PanelSettings {
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
}

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

  fileType?: "md" | "mdx" | string;
  previewPath?: string | null;
  pageBundle?: boolean;
  template?: string;
}

export type FieldType = "string" | "number" | "datetime" | "boolean" | "image" | "choice" | "tags" | "categories" | "draft" | "taxonomy" | "fields" | "json" | "block" | "file" | "dataFile" | "list" | "slug";

export interface Field {
  title?: string;
  name: string;
  type: FieldType;
  choices?: string[] | Choice[];
  single?: boolean;
  wysiwyg?: boolean;
  multiple?: boolean;
  isPreviewImage?: boolean;
  hidden?: boolean;
  taxonomyId?: string;
  default?: string;
  fields?: Field[];
  fieldGroup?: string | string[];
  dataType?: string | string[];
  taxonomyLimit?: number;
  fileExtensions?: string[];
  editable?: boolean;

  // Date fields
  isPublishDate?: boolean;
  isModifiedDate?: boolean;

  // Data file
  dataFileId?: string;
  dataFileKey?: string;
  dataFileValue?: string;
}

export interface DateInfo {
  format: string;
}

export interface SEO {
  title: number;
  slug: number;
  description: number;
  content: number;
  descriptionField: string;
}

export interface Slug {
  prefix: number | string;
  suffix: number | string;
  updateFileName?: boolean;
}

export interface FolderInfo {
  title: string;
  files: number;
  lastModified: FileInfo[];
}

export interface FileInfo extends FileStat {
  filePath: string;
  fileName: string;
  folderName: string | undefined;
};

export interface CustomScript {
  title: string;
  script: string;
  nodeBin?: string;
  bulk?: boolean;
  output?: "notification" | "editor";
  outputType?: string;
  type?: ScriptType;
  command?: CommandType;
}

export interface PreviewSettings {
  host: string | undefined;
  pathname: string | undefined;
}

export interface CustomTaxonomy {
  id: string;
  options: string[];
}

export enum ScriptType {
  Content = "content",
  MediaFolder = "mediaFolder",
  MediaFile = "mediaFile"
}

export enum CommandType {
  Node = "node",
  Shell = "shell",
  PowerShell = "powershell",
  Python = "python",
  Python3 = "python3"
}