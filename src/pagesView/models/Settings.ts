import { ContentFolder } from './../../models/ContentFolder';

export interface Settings { 
  folders: ContentFolder[]; 
  initialized: boolean 
}