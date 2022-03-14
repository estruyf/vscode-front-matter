import { Position } from 'vscode';
import { NavigationType } from '../dashboardWebView/models';
import { BlockFieldData } from './BlockFieldData';

export interface DashboardData {
  type: NavigationType;
  data?: ViewData;
}

export interface ViewData {
  filePath?: string;
  fieldName?: string;
  position?: Position;
  fileTitle?: string;
  selection?: string;
  pageBundle?: boolean;
  metadataInsert?: boolean;
  blockData?: BlockFieldData;
  parents?: string[];
  multiple?: string[];
  value?: string;
}