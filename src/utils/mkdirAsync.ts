import { promisify } from "util";
import { mkdir as mkdirCb } from "fs";

export const mkdirAsync = promisify(mkdirCb);