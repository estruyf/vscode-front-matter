export interface DataFolder {
  id: string;
  path: string;
  labelField: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema?: any;
  type?: string;
  singleEntry?: boolean;
  enableFileCreation?: boolean;
  fileType?: 'json' | 'yaml';
}
