import { BlockFieldData } from './BlockFieldData';

export interface CustomTaxonomyData {
  id: string | undefined;
  name: string | undefined;
  options?: string[] | undefined;
  option?: string | undefined;
  parents?: string[];
  renderAsString?: boolean;
  blockData?: BlockFieldData;
}
