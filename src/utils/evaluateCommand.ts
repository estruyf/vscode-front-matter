import { exec } from 'child_process';
import { getShellPath } from '../utils';
import { Logger } from '../helpers';

/**
 * Evaluate the command dynamically using `which` command
 * @param command
 * @returns
 */
export const evaluateCommand = (command: string): Promise<string> => {
  const shell = getShellPath();
  let shellPath: string | undefined = undefined;
  if (typeof shell !== 'string' && !!shell) {
    shellPath = shell.path;
  } else {
    shellPath = shell || undefined;
  }

  return new Promise((resolve, reject) => {
    exec(`which ${command}`, { shell: shellPath }, (error, stdout) => {
      if (error) {
        Logger.error(`Error evaluating command: ${command}`);
        reject(error);
        return;
      }

      resolve(stdout.trim());
    });
  });
};
