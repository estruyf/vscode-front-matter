export interface ContentFolder {
  title: string;
  path: string;
  
  excludeSubdir?: boolean;
  previewPath?: string;
  filePrefix?: string;
}