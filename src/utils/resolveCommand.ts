import { isAbsolute } from 'path';
import { existsAsync } from './existsAsync';
import { getPlatform } from './getPlatform';

/**
 * Resolve the file and arguments to use with `execFile`, so that the arguments are never
 * interpreted by a shell. The command itself is resolved like it was with `exec`:
 * - an absolute path to an existing file is executed as is (the path can contain spaces)
 * - on macOS/Linux, `/bin/sh` interprets the command and receives the arguments as `"$@"`
 * - on Windows, the command is split on whitespace (double quotes group) and runs without a shell
 * @param command
 * @param args
 * @returns
 */
export const resolveCommand = async (
  command: string,
  args: string[]
): Promise<{ file: string; args: string[] }> => {
  if (isAbsolute(command) && (await existsAsync(command))) {
    return { file: command, args };
  }

  if (getPlatform() !== 'windows') {
    return { file: '/bin/sh', args: ['-c', `${command} "$@"`, command, ...args] };
  }

  const [file, ...commandArgs] = splitCommand(command);
  return { file, args: [...commandArgs, ...args] };
};

/**
 * Split the command on whitespace, text between double quotes is kept together
 * @param command
 * @returns
 */
const splitCommand = (command: string): string[] => {
  const parts: string[] = [];
  let crntPart = '';
  let inQuotes = false;
  let hasPart = false;

  for (const char of command) {
    if (char === '"') {
      inQuotes = !inQuotes;
      hasPart = true;
    } else if (/\s/.test(char) && !inQuotes) {
      if (hasPart) {
        parts.push(crntPart);
        crntPart = '';
        hasPart = false;
      }
    } else {
      crntPart += char;
      hasPart = true;
    }
  }

  if (hasPart) {
    parts.push(crntPart);
  }

  return parts;
};
