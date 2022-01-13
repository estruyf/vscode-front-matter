import { DataFile } from './../models/DataFile';
import { DashboardMessage } from "../dashboardWebView/DashboardMessage";
import { BaseListener } from "./BaseListener";
import { DashboardCommand } from '../dashboardWebView/DashboardCommand';
import { Folders } from '../commands/Folders';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';


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
    const { file, entries } = msgData as { file: string, entries: any[] };

    const absPath = Folders.getAbsFilePath(file);
    if (!existsSync(absPath)) {
      const dirPath = dirname(absPath);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }
    }
    writeFileSync(absPath, JSON.stringify(entries, null, 2));

    this.processDataFile(msgData);
  }

  private static async processDataFile(msgData: DataFile) {
    const { file } = msgData;
    const dataFile = this.getDataFile(file);
    const jsonData = dataFile ? JSON.parse(dataFile) : [];
    this.sendMsg(DashboardCommand.dataFileEntries, jsonData);
  }

  private static getDataFile(file: string) {
    const absPath = Folders.getAbsFilePath(file);
    if (existsSync(absPath)) {
      return readFileSync(absPath, 'utf8');
    }

    return null;
  }
}