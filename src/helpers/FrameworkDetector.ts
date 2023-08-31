import { parseWinPath } from './parseWinPath';
import * as jsoncParser from 'jsonc-parser';
import jsyaml = require('js-yaml');
import { join, resolve, relative, dirname } from 'path';
import { commands, Uri } from 'vscode';
import { Folders } from '../commands/Folders';
import {
  COMMAND_NAME,
  SETTING_CONTENT_STATIC_FOLDER,
  SETTING_FRAMEWORK_ID,
  STATIC_FOLDER_PLACEHOLDER
} from '../constants';
import { FrameworkDetectors } from '../constants/FrameworkDetectors';
import { Framework, StaticFolder } from '../models';
import { Logger } from './Logger';
import { existsAsync, readFileAsync } from '../utils';
import { Settings } from '.';
import { parse } from 'path';

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
      if (await existsAsync(pkgFile)) {
        let packageJson: any = await readFileAsync(pkgFile, 'utf8');
        if (packageJson) {
          packageJson =
            typeof packageJson === 'string' ? jsoncParser.parse(packageJson) : packageJson;

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
      if (await existsAsync(gemFile)) {
        gemContent = await readFileAsync(gemFile, 'utf8');
      }
    } catch (e) {
      // do nothing
    }

    for (const detector of FrameworkDetectors) {
      if (detector && folder) {
        // Verify by dependencies
        for (const dependency of detector.requiredDependencies ?? []) {
          // Checks for package.json dependencies
          const inDependencies = dependencies && dependencies[dependency];
          const inDevDependencies = devDependencies && devDependencies[dependency];
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
          const fileExists = await existsAsync(resolve(folder, filename));
          if (fileExists) {
            return detector.framework;
          }
        }
      }
    }

    return undefined;
  }

  public static async checkDefaultSettings(framework: Framework) {
    if (framework.name.toLowerCase() === 'jekyll') {
      await FrameworkDetector.jekyll();
    } else if (framework.name.toLowerCase() === 'hexo') {
      await FrameworkDetector.hexo();
    }
  }

  /**
   * Check if there are any changes for the current framework that need to be applied
   * @param relAssetPath
   * @param filePath
   */
  public static relAssetPathUpdate(relAssetPath: string, filePath: string): string {
    const staticFolderValue = Settings.get<string | StaticFolder>(SETTING_CONTENT_STATIC_FOLDER);
    const staticFolder = Folders.getStaticFolderRelativePath();
    const frameworkId = Settings.get(SETTING_FRAMEWORK_ID);

    // Support for HEXO post asset folders
    if (staticFolder === STATIC_FOLDER_PLACEHOLDER.hexo.placeholder) {
      relAssetPath = relAssetPath.replace(STATIC_FOLDER_PLACEHOLDER.hexo.postsFolder, '');

      // Filename without the extension
      const fileParsing = parse(filePath);
      const name = fileParsing.name;
      relAssetPath = relAssetPath.replace(name, '');
      relAssetPath = join(relAssetPath);

      // Remove remove the slash at the beginning
      relAssetPath = parseWinPath(relAssetPath);
      if (relAssetPath.startsWith('/')) {
        relAssetPath = relAssetPath.substring(1);
      }
    }
    // Support for the Astro assets folder or when you need relative paths
    else if (
      staticFolder &&
      staticFolderValue &&
      typeof staticFolderValue !== 'string' &&
      staticFolderValue.relative
    ) {
      const absAssetPath = parseWinPath(
        join(Folders.getWorkspaceFolder()?.fsPath || '', staticFolder, relAssetPath)
      );

      const fileDir = dirname(filePath);
      const assetDir = dirname(absAssetPath);
      const fileName = parse(absAssetPath);

      relAssetPath = relative(fileDir, assetDir);
      relAssetPath = join(relAssetPath, `${fileName.name}${fileName.ext}`);
    }
    // Support for HEXO image folder
    else if (frameworkId === 'hexo') {
      relAssetPath = parseWinPath(relAssetPath);
      if (relAssetPath.startsWith('/')) {
        relAssetPath = relAssetPath.substring(1);
      }
    }

    return parseWinPath(relAssetPath);
  }

  /**
   * Define the default settings for Hexo
   */
  private static async hexo() {
    try {
      const wsFolder = Folders.getWorkspaceFolder();
      const hexoConfig = join(wsFolder?.fsPath || '', '_config.yml');
      let assetFoler = 'source/images';

      if (await existsAsync(hexoConfig)) {
        const content = await readFileAsync(hexoConfig, 'utf8');
        // Convert YAML to JSON
        const config = jsyaml.safeLoad(content);

        // Check if post assets are used: https://hexo.io/docs/asset-folders.html#Post-Asset-Folder
        if (config.post_asset_folder) {
          assetFoler = STATIC_FOLDER_PLACEHOLDER.hexo.placeholder;
        }
      }

      await Settings.update(SETTING_CONTENT_STATIC_FOLDER, assetFoler, true);
    } catch (e) {
      Logger.error(
        `Something failed while processing your Hexo configuration. ${(e as Error).message}`
      );
    }
  }

  /**
   * Define the default settings for Jekyll
   */
  private static async jekyll() {
    try {
      const wsFolder = Folders.getWorkspaceFolder();
      const jekyllConfig = join(wsFolder?.fsPath || '', '_config.yml');
      let collectionDir = '';

      if (await existsAsync(jekyllConfig)) {
        const content = await readFileAsync(jekyllConfig, 'utf8');
        // Convert YAML to JSON
        const config = jsyaml.safeLoad(content);

        if (config.collections_dir) {
          collectionDir = config.collections_dir;
        }
      }

      const draftsPath = join(wsFolder?.fsPath || '', collectionDir, '_drafts');
      const postsPath = join(wsFolder?.fsPath || '', collectionDir, '_posts');

      if (await existsAsync(draftsPath)) {
        const folderUri = Uri.file(draftsPath);
        commands.executeCommand(COMMAND_NAME.registerFolder, {
          title: 'drafts',
          path: folderUri
        });
      }

      if (await existsAsync(postsPath)) {
        const folderUri = Uri.file(postsPath);
        commands.executeCommand(COMMAND_NAME.registerFolder, {
          title: 'posts',
          path: folderUri
        });
      }
    } catch (e) {
      Logger.error(
        `Something failed while processing your Jekyll configuration. ${(e as Error).message}`
      );
    }
  }
}
