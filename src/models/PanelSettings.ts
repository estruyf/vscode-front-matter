import { FileStat } from "vscode";
import { DraftField } from ".";
import { Choice } from "./Choice";
import { DashboardData } from "./DashboardData";

export interface PanelSettings {
  seo: SEO;
  slug: Slug;
  tags: string[];
  date: DateInfo;
  categories: string[];
  freeform: boolean;
  scripts: CustomScript[];
  isInitialized: boolean;
  modifiedDateUpdate: boolean;
  writingSettingsEnabled: boolean;
  fmHighlighting: boolean;
  preview: PreviewSettings;
  contentTypes: ContentType[];
  dashboardViewData: DashboardData | undefined;
  draftField: DraftField;
}

export interface ContentType {
  name: string;
  fields: Field[];

  previewPath?: string | null;
  pageBundle?: boolean;
}

export interface Field {
  title?: string;
  name: string;
  type: "string" | "number" | "datetime" | "boolean" | "image" | "choice" | "tags" | "categories" | "draft";
  choices?: string[] | Choice[];
  single?: boolean;
  multiple?: boolean;
  isPreviewImage?: boolean;
  hidden?: boolean;
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
  prefix: number;
  suffix: number;
}

export interface FolderInfo {
  title: string;
  files: number;
  lastModified: FileInfo[];
}

export interface FileInfo extends FileStat {
  filePath: string;
  fileName: string;
};

export interface CustomScript {
  title: string;
  script: string;
  nodeBin?: string;
  bulk?: boolean;
  output?: "notification" | "editor";
  outputType?: string;
}

export interface PreviewSettings {
  host: string | undefined;
  pathname: string | undefined;
}