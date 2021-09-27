import { Stats } from "fs";

export interface MediaPaths { 
  media: MediaInfo[];
  total: number;
  folders: string[];
}

export interface MediaInfo {
  fsPath: string; 
  vsPath: string | undefined;
  stats: Stats | undefined;
  description?: string | undefined;
  alt?: string | undefined;
}