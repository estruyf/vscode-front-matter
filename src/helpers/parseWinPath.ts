import { isWindows } from '../utils';

export const parseWinPath = (path: string | undefined): string => {
  path = path?.split(`\\`).join(`/`) || '';

  if (isWindows()) {
    // Check if path starts with a drive letter (e.g., "C:\")
    if (/^[a-zA-Z]:\\/.test(path)) {
      // Convert to lowercase drive letter
      path = path.charAt(0).toLowerCase() + path.slice(1);
    }
  }

  return path;
};
