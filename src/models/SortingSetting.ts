import { SortOrder, SortType } from ".";

export interface SortingSetting {
  title: string;
  name: string;
  order: SortOrder;
  type: SortType;
  id?: string;
}