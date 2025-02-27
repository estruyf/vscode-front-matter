import { dirname, relative } from 'path';
import { ContentFolder } from '../models';
import { parseWinPath } from './parseWinPath';

export const processPathPlaceholders = (
  value: string,
  path: string,
  filePath: string,
  contentFolder: ContentFolder | null | undefined
) => {
  if (value && value.includes('{{pathToken.')) {
    const relPathToken = '{{pathToken.relPath}}';
    if (value.includes(relPathToken) && contentFolder?.path) {
      const dirName = dirname(filePath);
      const relPath = parseWinPath(relative(contentFolder.path, dirName));
      value = value.replace(relPathToken, relPath);
    }

    const regex = /{{pathToken.(\d+|relPath)}}/g;
    const matches = value.match(regex);
    if (matches) {
      for (const match of matches) {
        const tokenIndex = match.replace('{{pathToken.', '').replace('}}', '');

        const pathTokens = path.split('/');
        if (tokenIndex === 'relPath') {
          // Return path without the file name
          const relFilePath = filePath.replace(contentFolder?.path || '', '');
          value = value.replace(match, relFilePath.substring(0, relFilePath.lastIndexOf('/')));
        } else {
          // Get the token from the path
          value = value.replace(match, pathTokens[Number(tokenIndex)]);
        }
      }
    }
  }

  return value;
};
