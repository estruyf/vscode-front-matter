import { promisify } from 'util';
import { copyFile as copyFileCb } from 'fs';

export const copyFileAsync = promisify(copyFileCb);
