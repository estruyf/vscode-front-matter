import { PagesListener } from './../listeners/dashboard';
import { ArticleHelper, Settings } from ".";
import { SETTING_CONTENT_DRAFT_FIELD, SETTING_TAXONOMY_CONTENT_TYPES, TelemetryEvent } from "../constants";
import { ContentType as IContentType, DraftField, Field } from '../models';
import { Uri, commands } from 'vscode'; 
import { Folders } from "../commands/Folders";
import { Questions } from "./Questions";
import { writeFileSync } from "fs";
import { Notifications } from "./Notifications";
import { DEFAULT_CONTENT_TYPE_NAME } from "../constants/ContentType";
import { Telemetry } from './Telemetry';


export class ContentType {

  /**
   * Retrieve the draft field
   * @returns 
   */
  public static getDraftField() {
    const draftField = Settings.get<DraftField | null | undefined>(SETTING_CONTENT_DRAFT_FIELD);
    if (draftField) {
      return draftField;
    }

    return null;
  }

  /**
   * Retrieve the field its status
   * @param data 
   * @returns 
   */
  public static getDraftStatus(data: { [field: string]: any }) {
    const contentType = ArticleHelper.getContentType(data);
    const draftSetting = ContentType.getDraftField();

    const draftField = contentType.fields.find(f => f.type === "draft");

    let fieldValue = null;

    if (draftField) {
      fieldValue = data[draftField.name];
    } else if (draftSetting && data && data[draftSetting.name]) {
      fieldValue = data[draftSetting.name];
    }

    if (draftSetting && fieldValue) {
      if (draftSetting.type === "boolean") {
        return fieldValue ? "Draft" : "Published";
      } else {
        return fieldValue;
      }
    }

    return null;
  }

  /**
   * Create content based on content types
   * @returns 
   */
  public static async createContent() {
    const selectedContentType = await Questions.SelectContentType();
    if (!selectedContentType) {
      return;
    }

    const selectedFolder = await Questions.SelectContentFolder();
    if (!selectedFolder) {
      return;
    }

    const contentTypes = ContentType.getAll();
    const folders = Folders.get();

    const location = folders.find(f => f.title === selectedFolder);
    if (contentTypes && location) {
      const folderPath = Folders.getFolderPath(Uri.file(location.path));
      const contentType = contentTypes.find(ct => ct.name === selectedContentType);
      if (folderPath && contentType) {
        ContentType.create(contentType, folderPath);
      }
    }
  }

  /**
   * Retrieve all content types
   * @returns 
   */
  public static getAll() {
    return Settings.get<IContentType[]>(SETTING_TAXONOMY_CONTENT_TYPES);
  }

  /**
   * Create a new file with the specified content type
   * @param contentType 
   * @param folderPath 
   * @returns 
   */
  private static async create(contentType: IContentType, folderPath: string) {

    const titleValue = await Questions.ContentTitle();
    if (!titleValue) {
      return;
    }

    let newFilePath: string | undefined = ArticleHelper.createContent(contentType, folderPath, titleValue);
    if (!newFilePath) {
      return;
    }

    let data: any = this.processFields(contentType, titleValue, {});

    data = ArticleHelper.updateDates(Object.assign({}, data));

    if (contentType.name !== DEFAULT_CONTENT_TYPE_NAME) {
      data['type'] = contentType.name;
    }

    const content = ArticleHelper.stringifyFrontMatter(``, data);

    writeFileSync(newFilePath, content, { encoding: "utf8" });

    await commands.executeCommand('vscode.open', Uri.file(newFilePath));

    Notifications.info(`Your new content has been created.`);

    Telemetry.send(TelemetryEvent.createContentFromContentType);

    // Trigger a refresh for the dashboard
    PagesListener.refresh();
  }

  /**
   * Process all content type fields
   * @param contentType 
   * @param data 
   */
  private static processFields(obj: IContentType | Field, titleValue: string, data: any) {
    
    if (obj.fields) {
      for (const field of obj.fields) {
        if (field.name === "title") {
          if (field.default) {
            data[field.name] = ArticleHelper.processKnownPlaceholders(field.default, titleValue);
            data[field.name] = ArticleHelper.processCustomPlaceholders(data[field.name], titleValue);
          } else {
            data[field.name] = titleValue;
          }
        } else {
          if (field.type === "fields") {
            data[field.name] = this.processFields(field, titleValue, {});
          } else {
            data[field.name] = field.default ? ArticleHelper.processKnownPlaceholders(field.default, titleValue) : "";
            data[field.name] = field.default ? ArticleHelper.processCustomPlaceholders(data[field.name], titleValue) : "";
          }
        }
      }
    }

    return data;
  }
}