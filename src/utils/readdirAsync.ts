import { promisify } from "util";
import { readdir as readdirCb } from "fs";

export const readdirAsync = promisify(readdirCb);