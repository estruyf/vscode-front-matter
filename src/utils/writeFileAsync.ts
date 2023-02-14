import { promisify } from 'util';
import { writeFile as writeFileCb } from 'fs';

export const writeFileAsync = promisify(writeFileCb);
