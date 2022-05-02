import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { FrameworkDetectors } from "../constants/FrameworkDetectors";

export class FrameworkDetector {

  public static get(folder: string) {
    return this.check(folder);
  }

  public static getAll() {
    return FrameworkDetectors.map((detector: any) => detector.framework);
  }

  private static check(folder: string) {
    let dependencies = null;
    let devDependencies = null;
    let gemContent = null;

    // Try fetching the package JSON file
    try {
      const pkgFile = join(folder, 'package.json');
      if (existsSync(pkgFile)) {
        let packageJson: any = readFileSync(pkgFile, "utf8");
        if (packageJson) {
          packageJson = typeof packageJson === "string" ? JSON.parse(packageJson) : packageJson;

          dependencies = packageJson.dependencies || null;
          devDependencies = packageJson.devDependencies || null;
        }
      }
    } catch (e) {
      // do nothing
    }

    // Try fetching the Gemfile
    try {
      const gemFile = join(folder, 'Gemfile');
      if (existsSync(gemFile)) {
        gemContent = readFileSync(gemFile, "utf8");
      }
    } catch (e) {
      // do nothing
    }

    for (const detector of FrameworkDetectors) {
      if (detector && folder) {

        // Verify by dependencies
        for (const dependency of detector.requiredDependencies ?? []) {
          // Checks for package.json dependencies
          const inDependencies = dependencies && dependencies[dependency]
          const inDevDependencies = devDependencies && devDependencies[dependency]
          if (inDependencies || inDevDependencies) {
            return detector.framework;
          }

          // Checks for Gemfile
          if (gemContent && gemContent.includes(dependency)) {
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
