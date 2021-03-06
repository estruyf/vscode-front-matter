
export interface PanelSettings {
  seo: SEO;
  slug: Slug;
  tags: string[];
  categories: string[];
  freeform: boolean;
  scripts: CustomScript[];
}

export interface SEO {
  title: number;
  description: number;
  descriptionField: string;
}

export interface Slug {
  prefix: number;
  suffix: number;
}

export interface CustomScript {
  title: string;
  script: string;
  nodeBin?: string;
}