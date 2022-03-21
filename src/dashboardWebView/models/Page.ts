import { Uri } from "vscode";

export interface Page {
  fmFolder: string;
  fmFilePath: string;
  fmFileName: string;
  fmModified: number;
  fmPublished: number | null | undefined;
  fmDraft: "Draft" | "Published",
  fmYear: number | null | undefined;
  fmPreviewImage: string;
  fmTags: string[];
  fmCategories: string[];

  title: string;
  slug: string;
  date: string | Date;
  draft: string;
  description: string;

  preview?: string;
  [prop: string]: any;
}