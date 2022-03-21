import { DataFile } from './../../models/DataFile';
import { DashboardMessage } from "../../dashboardWebView/DashboardMessage";
import { BaseListener } from "./BaseListener";
import { DashboardCommand } from '../../dashboardWebView/DashboardCommand';
import { Folders } from '../../commands/Folders';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import * as yaml from 'js-yaml';
import { Logger, Notifications } from '../../helpers';
import { commands } from 'vscode';


export class DataListener extends BaseListener {
  
  public static process(msg: { command: DashboardMessage, data: any }) {
    super.process(msg);

    switch(msg.command) {
      case (DashboardMessage.getDataEntries):
        if (!(msg?.data as DataFile).file) {
          this.sendMsg(DashboardCommand.dataFileEntries, []);
        }
        
        this.processDataFile(msg?.data);
        break;
      case (DashboardMessage.putDataEntries):
        this.processDataUpdate(msg?.data);
        break;
      default:
        return;
    }
  }

  private static processDataUpdate(msgData: any) {
    const { file, fileType, entries } = msgData as { file: string, fileType: string, entries: any[] };

    const absPath = Folders.getAbsFilePath(file);
    if (!existsSync(absPath)) {
      const dirPath = dirname(absPath);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }
    }

    if (fileType === 'yaml') {
      const yamlData = yaml.safeDump(entries);
      writeFileSync(absPath, yamlData, 'utf8');
    } else {
      writeFileSync(absPath, JSON.stringify(entries, null, 2));
    } 

    this.processDataFile(msgData);
  }

  /**
   * Process the file data
   * @param msgData 
   */
  private static async processDataFile(msgData: DataFile) {
    try {
      const { file } = msgData;
      const dataFile = this.getDataFile(file);

      if (msgData.fileType === "yaml") {
        const entries = yaml.safeLoad(dataFile || "");
        this.sendMsg(DashboardCommand.dataFileEntries, entries);
      } else {
        const jsonData = dataFile ? JSON.parse(dataFile) : [];
        this.sendMsg(DashboardCommand.dataFileEntries, jsonData);
      }
    } catch (ex) {
      Logger.error(`DataListener::processDataFile: ${(ex as Error).message}`);
      const btnClick = await Notifications.error(`Something went wrong while processing the data file. Check your file and output log for more information.`, 'Open output');

      if (btnClick && btnClick === 'Open output') {
        commands.executeCommand(`workbench.panel.output.focus`);
      }
    }
  }

  /**
   * Retrieve the file data
   * @param file 
   * @returns 
   */
  private static getDataFile(file: string) {
    const absPath = Folders.getAbsFilePath(file);
    if (existsSync(absPath)) {
      return readFileSync(absPath, 'utf8');
    }

    return null;
  }
}