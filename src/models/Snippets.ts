import { Field } from './PanelSettings';

export interface Snippets {
  [snippetName: string]: Snippet;
}

export interface Snippet {
  title?: string;
  description: string;
  body: string[] | string;
  fields: SnippetField[];
  openingTags?: string;
  closingTags?: string;
  isMediaSnippet?: boolean;
  sourcePath?: string;
}

export type SnippetSpecialPlaceholders = 'FM_SELECTED_TEXT' | string;

export interface SnippetField extends Field {
  default?: SnippetSpecialPlaceholders;
  value?: unknown;
}
