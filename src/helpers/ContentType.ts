import { PagesListener } from './../listeners/dashboard';
import { ArticleHelper, Settings } from ".";
import { SETTING_CONTENT_DRAFT_FIELD, SETTING_DATE_FORMAT, SETTING_TAXONOMY_CONTENT_TYPES, TelemetryEvent } from "../constants";
import { ContentType as IContentType, DraftField, Field } from '../models';
import { Uri, commands, window } from 'vscode'; 
import { Folders } from "../commands/Folders";
import { Questions } from "./Questions";
import { writeFileSync } from "fs";
import { Notifications } from "./Notifications";
import { DEFAULT_CONTENT_TYPE_NAME } from "../constants/ContentType";
import { Telemetry } from './Telemetry';
import { processKnownPlaceholders } from './PlaceholderHelper';

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
   * Generate a content type
   */
  public static async generate() {
    const content = ArticleHelper.getCurrent();

    if (!content || !content.data) {
      Notifications.warning(`No front matter data found to generate a content type.`);
      return;
    }

    const answer = await window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: "Enter the name of the content type to generate",
      prompt: "Enter the name of the content type to generate",
      title: "Generate Content Type",
      validateInput: (value: string) => {
        if (!value) {
          return "Please enter a name for the content type";
        }

        const contentTypes = ContentType.getAll();
        if (contentTypes && contentTypes.find(ct => ct.name.toLowerCase() === value.toLowerCase())) {
          return "A content type with this name already exists";
        }

        return null;
      }
    });

    if (!answer) {
      Notifications.warning(`You didn't specify a name for the content type.`);
      return;
    }

    const fields = ContentType.generateFields(content.data);
    
    const newContentType: IContentType = {
      name: answer,
      fields
    };

    const contentTypes = ContentType.getAll() || [];
    contentTypes.push(newContentType);

    Settings.update(SETTING_TAXONOMY_CONTENT_TYPES, contentTypes, true);
    Notifications.info(`Content type ${answer} has been generated.`);
  }

  /**
   * Generate the fields from the data
   * @param data 
   * @param fields 
   * @returns 
   */
  private static generateFields(data: any, fields: any[] = []) {
    for (const field in data) {
      const fieldData = data[field];

      if (fieldData && fieldData instanceof Array && fieldData.length > 0 && typeof fieldData[0] === "string") {
        if (field.toLowerCase() === "tag" || field.toLowerCase() === "tags") {
          fields.push({
            title: field,
            name: field,
            type: "tags",
          } as Field);
        } else if (field.toLowerCase() === "category" || field.toLowerCase() === "categories") {
          fields.push({
            title: field,
            name: field,
            type: "categories",
          } as Field);
        } else {
          fields.push({
            title: field,
            name: field,
            type: "choice",
            choices: fieldData
          } as Field);
        }
      } else if (fieldData && fieldData instanceof Array && fieldData.length > 0 && typeof fieldData[0] === "object") {
        const newFields = ContentType.generateFields(fieldData);
        fields.push({
          title: field,
          name: field,
          type: "block",
          fields: newFields
        } as Field);
      } else if (fieldData && fieldData instanceof Object) {
        const newFields = ContentType.generateFields(fieldData);
        fields.push({
          title: field,
          name: field,
          type: "fields",
          fields: newFields
        } as Field);
      } else {
        if (!isNaN(new Date(fieldData).getDate())) {
          fields.push({
            title: field,
            name: field,
            type: "datetime"
          } as Field);
        } else if (field.toLowerCase() === "draft") {
          fields.push({
            title: field,
            name: field,
            type: "draft"
          } as Field);
        } else {
          fields.push({
            title: field,
            name: field,
            type: typeof fieldData
          } as Field);
        }
      }
    }

    return fields;
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
      const dateFormat = Settings.get(SETTING_DATE_FORMAT) as string;
      for (const field of obj.fields) {
        if (field.name === "title") {
          if (field.default) {
            data[field.name] = processKnownPlaceholders(field.default, titleValue, dateFormat);
            data[field.name] = ArticleHelper.processCustomPlaceholders(data[field.name], titleValue);
          } else {
            data[field.name] = titleValue;
          }
        } else {
          if (field.type === "fields") {
            data[field.name] = this.processFields(field, titleValue, {});
          } else {
            const defaultValue = field.default;

            if (typeof defaultValue === "string") {
              data[field.name] = processKnownPlaceholders(defaultValue, titleValue, dateFormat);
              data[field.name] = ArticleHelper.processCustomPlaceholders(data[field.name], titleValue);
            } else {
              data[field.name] = typeof defaultValue !== "undefined" ? defaultValue : "";
            }
          }
        }
      }
    }

    return data;
  }
}