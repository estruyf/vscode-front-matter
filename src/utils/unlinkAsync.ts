import { promisify } from "util";
import { unlink as unlinkCb } from "fs";

export const unlinkAsync = promisify(unlinkCb);