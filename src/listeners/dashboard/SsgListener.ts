import { Uri, workspace } from 'vscode';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { AstroCollection, AstroField, ContentType, Field, PostMessageData } from '../../models';
import { BaseListener } from './BaseListener';
import { exec } from 'child_process';
import { Extension, Logger, Settings } from '../../helpers';
import { Folders } from '../../commands';
import {
  DEFAULT_CONTENT_TYPE_NAME,
  SETTING_TAXONOMY_CONTENT_TYPES,
  SsgScripts
} from '../../constants';
import { SettingsListener } from './SettingsListener';
import { Terminal } from '../../services';
import { existsAsync, readFileAsync } from '../../utils';
import { join } from 'path';

export class SsgListener extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case DashboardMessage.ssgGetAstroContentTypes:
        SsgListener.getAstroContentTypes(msg);
        break;
      case DashboardMessage.ssgSetAstroContentTypes:
        SsgListener.ssgSetAstroContentTypes(msg);
        break;
    }
  }

  /**
   * Creata a content type from the Astro content collection
   * @param param0
   * @returns
   */
  private static async ssgSetAstroContentTypes({ command, requestId, payload }: PostMessageData) {
    if (!command || !requestId || !payload) {
      return;
    }

    const { collection } = payload as { collection: AstroCollection };

    const contentType: ContentType = {
      name: collection.name,
      filePrefix: undefined,
      previewPath: undefined,
      pageBundle: false,
      clearEmpty: true,
      fields: []
    };

    for (const field of collection.fields) {
      const ctField = SsgListener.getCtFieldForAstroField(field, collection.fields);

      if (ctField) {
        contentType.fields.push(ctField);
      }
    }

    // Set the preview image on the first found image of the content type
    const images = contentType.fields.filter((f) => f.type === 'image');
    if (images.length > 0) {
      images[0].isPreviewImage = true;
    }

    let contentTypes = Settings.get<ContentType[]>(SETTING_TAXONOMY_CONTENT_TYPES) || [];

    // Filter out the default content type
    contentTypes = contentTypes.filter((ct) => ct.name !== DEFAULT_CONTENT_TYPE_NAME);

    if (contentTypes.find((ct) => ct.name === collection.name)) {
      SsgListener.sendRequest(command as any, requestId, {});
      SettingsListener.getSettings(true);
      return;
    }

    try {
      // Check if the content folder exists
      const folderName = `/src/content/${collection.name}`;
      const folderUri = Uri.joinPath(Folders.getWorkspaceFolder()!, folderName);
      await workspace.fs.readDirectory(folderUri);

      await Folders.register({
        title: collection.name,
        path: folderUri,
        contentType: [collection.name]
      });

      contentType.previewPath = `'${collection.name}'`;
    } catch (e) {
      // Something failed, so it seems the folder does not exist
    }

    contentTypes.push(contentType);
    await Settings.safeUpdate(SETTING_TAXONOMY_CONTENT_TYPES, contentTypes, true);

    SsgListener.sendRequest(command as any, requestId, {});
    SettingsListener.getSettings(true);
  }

  /**
   * Get the Astro content types from the local project
   * @param command
   * @param requestId
   */
  private static async getAstroContentTypes({ command, requestId }: PostMessageData) {
    if (!command || !requestId) {
      return;
    }

    // https://github.com/withastro/astro/blob/defab70cb2a0c67d5e9153542490d2749046b151/packages/astro/src/content/utils.ts#L450
    const contentConfig = await workspace.findFiles(`**/src/content/config.*`);

    if (contentConfig.length === 0) {
      SsgListener.sendRequest(command as any, requestId, []);
      return;
    }

    const contentConfigFile = contentConfig[0];
    if (
      !contentConfigFile.fsPath.endsWith('.js') &&
      !contentConfigFile.fsPath.endsWith('.mjs') &&
      !contentConfigFile.fsPath.endsWith('.ts') &&
      !contentConfigFile.fsPath.endsWith('.mts')
    ) {
      SsgListener.sendRequest(command as any, requestId, []);
      return;
    }

    const scriptPath = Uri.joinPath(
      Extension.getInstance().extensionPath,
      SsgScripts.folder,
      SsgScripts.astroContentCollectionScript
    );

    const wsFolder = Folders.getWorkspaceFolder();
    if (!wsFolder) {
      SsgListener.sendRequest(command as any, requestId, []);
      return;
    }

    const tempLocation = Uri.joinPath(wsFolder, '/.frontmatter/temp');
    const tempScriptPath = Uri.joinPath(tempLocation, SsgScripts.astroContentCollectionScript);
    await workspace.fs.createDirectory(tempLocation);

    // Check if the workspace uses pnpm
    if (await existsAsync(Uri.joinPath(wsFolder, 'node_modules/.pnpm').fsPath)) {
      const vitePackageFiles = await workspace.findFiles(
        `**/node_modules/.pnpm/vite@*/node_modules/vite/package.json`
      );
      if (vitePackageFiles.length > 0) {
        const vitePackageFile = vitePackageFiles[0];
        const vitePackage = JSON.parse(await readFileAsync(vitePackageFile.fsPath, 'utf8')) as {
          main: string;
        };
        const viteFolder = vitePackageFile.fsPath.replace('/package.json', '');
        const vitePath = join(viteFolder, vitePackage.main).replace(wsFolder.fsPath, '../..');

        // Update the vite reference, as it is not a direct dependency of the project
        let scriptContents = await readFileAsync(scriptPath.fsPath, 'utf8');
        scriptContents = scriptContents.replace(`'vite'`, `'${vitePath}'`);
        await workspace.fs.writeFile(tempScriptPath, Buffer.from(scriptContents, 'utf8'));
      }
    } else {
      workspace.fs.copy(scriptPath, tempScriptPath, { overwrite: true });
    }

    const fullScript = `node "${tempScriptPath.fsPath}" "${contentConfigFile.fsPath}"`;

    try {
      const result: string = await SsgListener.executeScript(fullScript, wsFolder?.fsPath || '');
      if (result) {
        const tempJsonPath = Uri.joinPath(tempLocation, SsgScripts.astroContentCollectionJSON);
        if (await existsAsync(tempJsonPath.fsPath)) {
          const contents = await readFileAsync(tempJsonPath.fsPath, 'utf8');
          let collections: AstroCollection[] = JSON.parse(contents);
          collections = collections.filter((c) => c.type === 'content');
          SsgListener.sendRequest(command as any, requestId, collections);
        }
      }
    } catch (error) {
      Logger.error((error as Error).message);
      SsgListener.sendRequest(command as any, requestId, []);
      return;
    } finally {
      await workspace.fs.delete(tempLocation, { recursive: true, useTrash: false });
    }
  }

  /**
   * Generate the ContentType field from the Astro field
   * @param field
   * @param collection
   * @returns
   */
  private static getCtFieldForAstroField(
    field: AstroField,
    collection: AstroField[]
  ): Field | undefined {
    let ctField: Field | undefined = undefined;
    const hasImageField = collection.find((f) => f.type === 'image');

    switch (field.type) {
      case 'email':
      case 'url':
      case 'ZodString':
        ctField = {
          name: field.name,
          type: 'string',
          single: true
        } as Field;
        break;
      case 'ZodNumber':
        ctField = {
          name: field.name,
          type: 'number'
        } as Field;
        break;
      case 'ZodBoolean':
        if (field.name === 'draft') {
          ctField = {
            name: field.name,
            type: 'draft'
          } as Field;
        } else {
          ctField = {
            name: field.name,
            type: 'boolean'
          } as Field;
        }
        break;
      case 'ZodArray':
        if (field.name === 'tags') {
          ctField = {
            name: field.name,
            type: 'tags'
          } as Field;
        } else if (field.name === 'categories') {
          ctField = {
            name: field.name,
            type: 'categories'
          } as Field;
        } else {
          ctField = {
            name: field.name,
            type: 'list'
          } as Field;
        }
        break;
      case 'ZodEnum':
        ctField = {
          name: field.name,
          type: 'choice',
          choices: field.options || []
        } as Field;
        break;
      case 'datetime':
      case 'ZodDate':
        ctField = {
          name: field.name,
          type: 'datetime',
          default: '{{now}}'
        } as Field;

        if (field.name.toLowerCase() === 'published') {
          ctField.isPublishDate = true;
        } else if (
          field.name.toLowerCase() === 'modified' ||
          field.name.toLowerCase() === 'updated'
        ) {
          ctField.isModifiedDate = true;
        }

        break;
      case 'image':
        ctField = {
          name: field.name,
          type: 'image'
        } as Field;
        break;
      case 'ZodObject':
        ctField = {
          name: field.name,
          type: 'fields'
        } as Field;
        break;
    }

    if (field.type === 'ZodObject' && field.fields) {
      ctField.fields = [];
      for (const subField of field.fields) {
        const ctSubField = SsgListener.getCtFieldForAstroField(subField, collection);

        if (ctSubField) {
          ctField.fields.push(ctSubField);
        }
      }
    }

    if (ctField && field.required) {
      ctField.required = field.required;
    }

    if (ctField && field.defaultValue) {
      ctField.default = field.defaultValue;
    }

    if (ctField && field.description) {
      ctField.description = field.description;
    }

    if (ctField && field.type === 'image' && !hasImageField) {
      ctField.isPreviewImage = true;
    }

    return ctField;
  }

  /**
   * Execute a script
   * @param fullScript
   * @param wsFolder
   * @returns
   */
  private static executeScript(fullScript: string, wsFolder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      Logger.info(`Executing script: ${fullScript}`);

      const shellPath: string | { path: string } | undefined = Terminal.shell;

      exec(
        fullScript,
        {
          cwd: wsFolder,
          shell: shellPath
        },
        (error, stdout) => {
          if (error) {
            reject(error);
            return;
          }

          if (stdout && stdout.endsWith(`\n`)) {
            // Remove empty line at the end of the string
            stdout = stdout.slice(0, -1);
          }

          resolve(stdout);
        }
      );
    });
  }
}
