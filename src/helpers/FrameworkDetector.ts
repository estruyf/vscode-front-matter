import { existsSync } from "fs";
import { resolve } from "path";
import { FrameworkDetectors } from "../constants/FrameworkDetectors";
import { Extension } from "./Extension";

export class FrameworkDetector {

  public static get(folder: string) {
    return this.check(folder);
  }

  public static getAll() {
    return FrameworkDetectors.map((detector: any) => detector.framework);
  }

  private static check(folder: string) {
    const { dependencies, devDependencies } = Extension.getInstance().packageJson;

    for (const detector of FrameworkDetectors) {
      if (detector && folder) {

        // Verify by dependencies
        for (const dependency of detector.requiredDependencies ?? []) {
          const inDependencies = dependencies && dependencies[dependency]
          const inDevDependencies = devDependencies && devDependencies[dependency]
          if (inDependencies || inDevDependencies) {
            return detector.framework;
          }
        }

        // Verify by files
        for (const filename of detector.requiredFiles ?? []) {
          const fileExists = existsSync(resolve(folder, filename));
          if (fileExists) {
            return detector.framework;
          }
        }
      }
    }

    return undefined;
  }
}
