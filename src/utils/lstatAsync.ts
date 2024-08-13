import { promisify } from 'util';
import { lstat as lstatCb } from 'fs';

export const lstatAsync = promisify(lstatCb);
