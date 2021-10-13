import { Uri } from "vscode";

export interface Page {
  fmFolder: string;
  fmFilePath: string;
  fmFileName: string;
  fmModified: number;
  fmDraft: "Draft" | "Published",
  fmYear: number | null | undefined;

  title: string;
  slug: string;
  date: string | Date;
  draft: string;
  description: string;

  preview?: string;
  [prop: string]: any;
}