import { Stats } from "fs";
import { ISizeCalculationResult } from "image-size/dist/types/interface";
import { FileStat } from "vscode";

export interface MediaPaths { 
  media: MediaInfo[];
  total: number;
  folders: string[];
  selectedFolder: string;
}

export interface MediaInfo extends FileStat {
  fsPath: string; 
  vsPath: string | undefined;
  stats: Stats | undefined;
  dimensions: ISizeCalculationResult | undefined;
  caption?: string | undefined;
  alt?: string | undefined;
  modified?: Date | undefined;
}