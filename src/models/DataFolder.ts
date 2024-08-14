export interface DataFolder {
  id: string;
  path: string;
  labelField: string;
  schema?: any;
  type?: string;
  singleEntry?: boolean;
  enableFileCreation?: boolean;
  fileType?: 'json' | 'yaml';
}
