import { parseWinPath } from '../../helpers/parseWinPath';

export const getRelPath = (path: string, staticFolder?: string, wsFolder?: string) => {
  let relPath: string | undefined = '';
  if (wsFolder && path) {
    const wsFolderParsed = parseWinPath(wsFolder);
    const mediaParsed = parseWinPath(path);

    relPath = mediaParsed.split(wsFolderParsed).pop();

    // If the static folder is the root, we can just return the relative path
    if (staticFolder === '/') {
      return relPath;
    } else if (staticFolder && relPath) {
      const staticFolderParsed = parseWinPath(staticFolder);
      relPath = relPath.split(staticFolderParsed).pop();
    }
  }
  return relPath;
};
