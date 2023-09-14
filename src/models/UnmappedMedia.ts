export interface UnmappedMedia {
  file: string;
  absPath: string;
  metadata: {
    title: string;
    [prop: string]: string;
  };
}
