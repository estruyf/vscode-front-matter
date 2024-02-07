import { ISizeCalculationResult } from 'image-size/dist/types/interface';

export interface MediaPaths {
  media: MediaInfo[];
  total: number;
  folders: string[];
  allContentFolders: string[];
  allStaticfolders: string[];
  selectedFolder: string;
}

export interface MediaInfo {
  filename: string;
  fsPath: string;
  vsPath: string | undefined;
  dimensions?: ISizeCalculationResult | undefined;
  mimeType?: string | undefined;
  mtime?: Date;
  ctime?: Date;
  size?: number;

  metadata: {
    title?: string | undefined;
    caption?: string | undefined;
    alt?: string | undefined;
    [fieldName: string]: string | string[] | Date | number | undefined;
  };
}
