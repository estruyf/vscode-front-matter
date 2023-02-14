import { promisify } from 'util';
import { rename as renameCb } from 'fs';

export const renameAsync = promisify(renameCb);
