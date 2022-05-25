import { DataFile } from './../../models/DataFile';
import { DashboardMessage } from "../../dashboardWebView/DashboardMessage";
import { BaseListener } from "./BaseListener";
import { DashboardCommand } from '../../dashboardWebView/DashboardCommand';
import { Folders } from '../../commands/Folders';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import * as yaml from 'js-yaml';
import { DataFileHelper } from '../../helpers';


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
    const entries = await DataFileHelper.process(msgData);
    this.sendMsg(DashboardCommand.dataFileEntries, entries);
  }
}