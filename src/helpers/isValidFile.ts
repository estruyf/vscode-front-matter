import { DEFAULT_FILE_TYPES } from './../constants/DefaultFileTypes';
import { Settings } from ".";
import { SETTING_CONTENT_SUPPORTED_FILETYPES } from "../constants";
import { extname } from 'path';


export const isValidFile = (fileName: string) => {
  let supportedFiles = Settings.get<string[]>(SETTING_CONTENT_SUPPORTED_FILETYPES) || DEFAULT_FILE_TYPES;
  supportedFiles = supportedFiles.map(f => f.startsWith(`.`) ? f : `.${f}`);

  // Get the extension of the file path
  const extension = extname(fileName);

  return supportedFiles.includes(extension);
}