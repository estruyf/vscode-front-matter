import { SortOrder, SortType } from "../../models";
import { SortOption } from "../constants/SortOption";

export interface SortingOption { 
  title?: string; 
  name: string; 
  id: SortOption | string; 
  order: SortOrder, 
  type: SortType;
}