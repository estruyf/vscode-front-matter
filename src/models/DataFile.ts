export interface DataFile {
  id: string;
  title: string;
  file: string;
  fileType: 'json' | 'yaml';
  labelField: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema?: any;
  type?: string;
  singleEntry?: boolean;
}
