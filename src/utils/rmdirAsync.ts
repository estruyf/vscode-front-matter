import { promisify } from 'util';
import { rmdir as rmdirCb } from 'fs';

export const rmdirAsync = promisify(rmdirCb);
