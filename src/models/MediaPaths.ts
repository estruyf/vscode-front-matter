import { ISizeCalculationResult } from "image-size/dist/types/interface";

export interface MediaPaths { 
  media: MediaInfo[];
  total: number;
  folders: string[];
  selectedFolder: string;
}

export interface MediaInfo {
  fsPath: string; 
  vsPath: string | undefined;
  dimensions?: ISizeCalculationResult | undefined;
  caption?: string | undefined;
  alt?: string | undefined;
  mtime?: Date;
  ctime?: Date;
  size?: number;
}