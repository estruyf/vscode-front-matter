import { workspace, window } from 'vscode';
import { DataFile } from './../../models/DataFile';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { BaseListener } from './BaseListener';
import { DashboardCommand } from '../../dashboardWebView/DashboardCommand';
import { Folders } from '../../commands/Folders';
import { basename, dirname, join } from 'path';
import * as yaml from 'js-yaml';
import { DataFileHelper, Logger } from '../../helpers';
import { existsAsync, readFileAsync, writeFileAsync } from '../../utils';
import { mkdirAsync } from '../../utils/mkdirAsync';
import { DataFolder, PostMessageData } from '../../models';
import { LocalizationKey, localize } from '../../localization';
import { SettingsListener } from './SettingsListener';

export class DataListener extends BaseListener {
  public static process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case DashboardMessage.getDataEntries:
        if (!(msg?.payload as DataFile).file) {
          this.sendMsg(DashboardCommand.dataFileEntries, []);
        }

        this.processDataFile(msg?.payload);
        break;
      case DashboardMessage.putDataEntries:
        this.processDataUpdate(msg?.payload);
        break;
      case DashboardMessage.createDataFile:
        this.createDataFile(msg.command, msg.requestId || '', msg.payload);
        break;
      default:
        return;
    }
  }

  /**
   * Creates a DataFile object based on the provided path and folder.
   *
   * @param path - The path of the file.
   * @param folder - The DataFolder object.
   * @returns The created DataFile object.
   */
  public static createDataFileObject(path: string, folder: DataFolder): DataFile {
    const filePath = Folders.wsPath(path);
    return {
      id: basename(path),
      title: basename(path),
      file: filePath,
      fileType: path.endsWith('.json') ? 'json' : 'yaml',
      labelField: folder.labelField,
      schema: folder.schema,
      type: folder.type,
      singleEntry: typeof folder.singleEntry === 'boolean' ? folder.singleEntry : false
    };
  }

  /**
   * Process the data update
   * @param msgData
   */
  private static async processDataUpdate(msgData: any) {
    const { file, fileType, entries } = msgData as {
      file: string;
      fileType: string;
      entries: unknown | unknown[];
    };

    const absPath = Folders.getAbsFilePath(file);
    if (!(await existsAsync(absPath))) {
      const dirPath = dirname(absPath);
      if (!(await existsAsync(dirPath))) {
        await mkdirAsync(dirPath, { recursive: true });
      }

      await writeFileAsync(absPath, '', 'utf8');
    }

    const fileContent = await readFileAsync(absPath, 'utf8');
    // check if file content ends with newline
    const newFileContent = fileContent.endsWith('\n');
    const insertFinalNewLine =
      newFileContent || workspace.getConfiguration().get('files.insertFinalNewline');

    if (fileType === 'yaml') {
      try {
        const yamlData = yaml.dump(entries);
        await writeFileAsync(absPath, insertFinalNewLine ? `${yamlData}\n` : yamlData, 'utf8');
      } catch (e) {
        Logger.error((e as Error).message);
      }
    } else {
      const jsonData = JSON.stringify(entries, null, 2);
      await writeFileAsync(absPath, insertFinalNewLine ? `${jsonData}\n` : jsonData, 'utf8');
    }

    this.processDataFile(msgData);
  }

  /**
   * Process the file data
   * @param msgData
   */
  private static async processDataFile(msgData: DataFile) {
    const entries = await DataFileHelper.process(msgData);
    this.sendMsg(DashboardCommand.dataFileEntries, entries);
  }

  /**
   * Create a new data file
   * @param command
   * @param requestId
   * @param data
   */
  private static async createDataFile(command: string, requestId: string, dataFolder: DataFolder) {
    if (!command || !requestId || !dataFolder) {
      return;
    }

    if (!dataFolder.id || !dataFolder.path) {
      this.sendError(
        command as DashboardCommand,
        requestId,
        localize(LocalizationKey.listenersPanelDataListenerCreateDataFileError)
      );
      return;
    }

    const fileName = await window.showInputBox({
      title: localize(LocalizationKey.listenersPanelDataListenerCreateDataFileInputTitle),
      prompt: localize(LocalizationKey.listenersPanelDataListenerCreateDataFileInputTitle),
      ignoreFocusOut: true
    });

    if (!fileName || fileName.trim() === '') {
      this.sendError(
        command as DashboardCommand,
        requestId,
        localize(LocalizationKey.listenersPanelDataListenerCreateDataFileNoFileName)
      );
      return;
    }

    const absPath = Folders.getAbsFilePath(dataFolder.path);
    if (!(await existsAsync(absPath))) {
      const dirPath = dirname(absPath);
      if (!(await existsAsync(dirPath))) {
        await mkdirAsync(dirPath, { recursive: true });
      }
    }

    // Check the file type and create the file
    const filePath = join(absPath, `${fileName}.${dataFolder.fileType || 'json'}`);
    await writeFileAsync(filePath, dataFolder.fileType === 'json' ? '{}' : '', 'utf8');

    // Update the settings
    await SettingsListener.getSettings(true);
    const dataFile = DataListener.createDataFileObject(filePath, dataFolder);
    this.sendRequest(command as DashboardCommand, requestId, dataFile);
  }
}
