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
      // Only strip the static folder when it is the leading path segment
      const staticFolderParsed = `/${parseWinPath(staticFolder).replace(/^\.?\/+|\/+$/g, '')}`;
      if (relPath.startsWith(`${staticFolderParsed}/`)) {
        relPath = relPath.substring(staticFolderParsed.length);
      }
    }
  }
  return relPath;
};
