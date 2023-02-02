import { promisify } from 'util';
import { readFile as readFileCb } from 'fs';

export const readFileAsync = promisify(readFileCb);
