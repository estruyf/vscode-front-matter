import { stat } from "fs";
import { promisify } from "util";

export const existsAsync = async (path: string) => {
  return promisify(stat)(path).then(() => true).catch(() => false);
};