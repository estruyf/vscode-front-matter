import * as jsoncParser from 'jsonc-parser';
import { existsSync } from "fs";
import jsyaml = require("js-yaml");
import { join, resolve } from "path";
import { commands, Uri } from "vscode";
import { Folders } from "../commands/Folders";
import { COMMAND_NAME } from "../constants";
import { FrameworkDetectors } from "../constants/FrameworkDetectors";
import { Framework } from "../models";
import { Logger } from "./Logger";
import { readFileAsync } from '../utils';

export class FrameworkDetector {

  public static get(folder: string) {
    return this.check(folder);
  }

  public static getAll() {
    return FrameworkDetectors.map((detector: any) => detector.framework);
  }

  private static async check(folder: string) {
    let dependencies = null;
    let devDependencies = null;
    let gemContent = null;

    // Try fetching the package JSON file
    try {
      const pkgFile = join(folder, 'package.json');
      if (existsSync(pkgFile)) {
        let packageJson: any = await readFileAsync(pkgFile, "utf8");
        if (packageJson) {
          packageJson = typeof packageJson === "string" ? jsoncParser.parse(packageJson) : packageJson;

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
        gemContent = await readFileAsync(gemFile, "utf8");
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

  public static async checkDefaultSettings(framework: Framework) {    
    if (framework.name.toLowerCase() === "jekyll") {
      await FrameworkDetector.jekyll();
    }
  }


  private static async jekyll() {
    try {
      const wsFolder = Folders.getWorkspaceFolder();
      const jekyllConfig = join(wsFolder?.fsPath || "", '_config.yml');
      let collectionDir = "";

      if (existsSync(jekyllConfig)) {
        const content = await readFileAsync(jekyllConfig, "utf8");
        // Convert YAML to JSON
        const config = jsyaml.safeLoad(content);

        if (config.collections_dir) {
          collectionDir = config.collections_dir;
        }
      }

      const draftsPath = join(wsFolder?.fsPath || "", collectionDir, "_drafts");
      const postsPath = join(wsFolder?.fsPath || "", collectionDir, "_posts");
  
      if (existsSync(draftsPath)) {
        const folderUri = Uri.file(draftsPath);
        commands.executeCommand(COMMAND_NAME.registerFolder, {
          title: "drafts",
          path: folderUri
        });
      }
  
      if (existsSync(postsPath)) {
        const folderUri = Uri.file(postsPath);
        commands.executeCommand(COMMAND_NAME.registerFolder, {
          title: "posts",
          path: folderUri
        });
      }
    } catch (e) {
      Logger.error(`Something failed while processing your Jekyll configuration. ${(e as Error).message}`);
    }
  }
}
