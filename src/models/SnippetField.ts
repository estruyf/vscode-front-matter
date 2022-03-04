export interface SnippetField {
  name: string;
  value: string;
  type: 'text' | 'textarea' | 'select';
  tmString: string;
  options?: string[];
}