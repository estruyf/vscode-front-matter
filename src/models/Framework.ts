export interface Framework {
  name: string;
  dist: string;
  static: string | string[];
  build: string;
  server?: string;
}
