export interface PageFrontMatter {
  title: string;
  slug: string;
  description: string;
  date: string;
  lastmod: string;
  content: string;
  fileName: string;
  weight?: number;
}