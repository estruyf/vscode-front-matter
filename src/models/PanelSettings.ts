import { FileType } from "vscode";
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
}

export interface ContentType {
  name: string;
  fields: Field[];
}

export interface Field {
  title?: string;
  name: string;
  type: "string" | "number" | "datetime" | "boolean" | "image" | "choice" | "tags" | "categories";
  choices?: string[];
}

export interface DateInfo {
  format: string;
}

export interface SEO {
  title: number;
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

export interface FileInfo {
  type: FileType;
  ctime: number;
  mtime: number;
  size: number;
  filePath: string;
  fileName: string;
};

export interface CustomScript {
  title: string;
  script: string;
  nodeBin?: string;
}

export interface PreviewSettings {
  host: string | undefined;
  pathname: string | undefined;
}