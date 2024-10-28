import * as os from 'os';

/**
 * Determines the current operating system platform.
 *
 * @returns {'windows' | 'linux' | 'osx'} - A string representing the platform:
 * - 'windows' for Windows OS
 * - 'osx' for macOS
 * - 'linux' for Linux OS
 */
export const getPlatform = (): 'windows' | 'linux' | 'osx' => {
  const platform = os.platform();
  if (platform === 'win32') {
    return 'windows';
  } else if (platform === 'darwin') {
    return 'osx';
  }

  return 'linux';
};
