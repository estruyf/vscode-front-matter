export interface Project {
  name: string;
  default?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configuration: any;
}
