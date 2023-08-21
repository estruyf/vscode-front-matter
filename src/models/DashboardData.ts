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
  range?: SnippetRange;
  snippetInfo?: SnippetInfo;
  pageBundle?: boolean;
  metadataInsert?: boolean;
  blockData?: BlockFieldData;
  parents?: string[];
  multiple?: string[];
  value?: string;

  // File fields
  type: 'file' | 'media';
  fileExtensions?: string[];
}

export interface SnippetRange {
  start: Position;
  end: Position;
}

export interface SnippetInfo {
  id: string;
  fields: SnippetInfoField[];
}

export interface SnippetInfoField {
  name: string;
  value: string;
}
