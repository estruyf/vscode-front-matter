export interface ContentFolder {
  title: string;
  path: string;

  excludeSubdir?: boolean;
  previewPath?: string;
  filePrefix?: string;
  contentTypes?: string[];
  originalPath?: string;
  $schema?: string;
  extended?: boolean;
}
