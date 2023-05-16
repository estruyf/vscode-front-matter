import { ModeListener } from './../listeners/general/ModeListener';
import { PagesListener } from './../listeners/dashboard';
import { ArticleHelper, CustomScript, Settings } from '.';
import {
  DefaultFieldValues,
  FEATURE_FLAG,
  SETTING_CONTENT_DRAFT_FIELD,
  SETTING_DATE_FORMAT,
  SETTING_FRAMEWORK_ID,
  SETTING_TAXONOMY_CONTENT_TYPES,
  SETTING_TAXONOMY_FIELD_GROUPS,
  TelemetryEvent
} from '../constants';
import {
  ContentType as IContentType,
  DraftField,
  Field,
  FieldGroup,
  FieldType,
  ScriptType
} from '../models';
import { Uri, commands, window, ProgressLocation, workspace } from 'vscode';
import { Folders } from '../commands/Folders';
import { Questions } from './Questions';
import { Notifications } from './Notifications';
import { DEFAULT_CONTENT_TYPE_NAME } from '../constants/ContentType';
import { Telemetry } from './Telemetry';
import { processKnownPlaceholders } from './PlaceholderHelper';
import { basename } from 'path';
import { ParsedFrontMatter } from '../parsers';
import { encodeEmoji, existsAsync, writeFileAsync } from '../utils';

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

    const draftField = contentType.fields.find((f) => f.type === 'draft');

    let fieldValue = null;

    if (draftField) {
      fieldValue = data[draftField.name];
    } else if (draftSetting && data && data[draftSetting.name]) {
      fieldValue = data[draftSetting.name];
    }

    if (draftSetting && fieldValue !== null) {
      if (draftSetting.type === 'boolean') {
        return fieldValue ? 'Draft' : 'Published';
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
    const selectedFolder = await Questions.SelectContentFolder();
    if (!selectedFolder) {
      return;
    }

    const contentTypes = ContentType.getAll();
    const folders = Folders.get();
    const folder = folders.find((f) => f.title === selectedFolder);

    if (!folder) {
      return;
    }

    const selectedContentType = await Questions.SelectContentType(folder.contentTypes || []);
    if (!selectedContentType) {
      return;
    }

    if (contentTypes && folder) {
      const folderPath = Folders.getFolderPath(Uri.file(folder.path));
      const contentType = contentTypes.find((ct) => ct.name === selectedContentType);
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
    if (!(await ContentType.verify())) {
      return;
    }

    Telemetry.send(TelemetryEvent.generateContentType);

    const content = ArticleHelper.getCurrent();

    const editor = window.activeTextEditor;
    const filePath = editor?.document.uri.fsPath;

    if (!content || !content.data) {
      Notifications.warning(`No front matter data found to generate a content type.`);
      return;
    }

    const override = await window.showQuickPick(['Yes', 'No'], {
      title: 'Override default content type',
      placeHolder:
        'Do you want to overwrite the default content type configuration with the fields used in the current field?',
      ignoreFocusOut: true
    });
    const overrideBool = override === 'Yes';

    let contentTypeName: string | undefined = `default`;

    // Ask for the new content type name
    if (!overrideBool) {
      contentTypeName = await window.showInputBox({
        title: 'Generate Content Type',
        placeHolder: 'Enter the name of the content type to generate',
        prompt: 'Enter the name of the content type to generate',
        ignoreFocusOut: true,
        validateInput: (value: string) => {
          if (!value) {
            return 'Please enter a name for the content type';
          }

          const contentTypes = ContentType.getAll();
          if (
            contentTypes &&
            contentTypes.find((ct) => ct.name.toLowerCase() === value.toLowerCase())
          ) {
            return 'A content type with this name already exists';
          }

          return null;
        }
      });

      if (!contentTypeName) {
        Notifications.warning(`You didn't specify a name for the content type.`);
        return;
      }
    }

    // Ask if the content type needs to be used as a page bundle
    let pageBundle = false;
    const fileName = filePath ? basename(filePath) : undefined;
    if (fileName?.startsWith(`index.`)) {
      const pageBundleAnswer = await window.showQuickPick(['Yes', 'No'], {
        title: 'Use as page bundle',
        placeHolder: 'Do you want to use this content type as a page bundle?',
        ignoreFocusOut: true
      });
      pageBundle = pageBundleAnswer === 'Yes';
    }

    const fields = ContentType.generateFields(content.data);

    // Update the type field in the page
    if (!overrideBool && editor) {
      content.data['type'] = contentTypeName;
      ArticleHelper.update(editor, content);
    }

    const newContentType: IContentType = {
      name: contentTypeName,
      pageBundle,
      fields
    };

    const contentTypes = ContentType.getAll() || [];

    if (overrideBool) {
      const index = contentTypes.findIndex((ct) => ct.name === contentTypeName);
      contentTypes[index].fields = fields;
    } else {
      contentTypes.push(newContentType);
    }

    await Settings.update(SETTING_TAXONOMY_CONTENT_TYPES, contentTypes, true);

    const configPath = Settings.projectConfigPath;
    const notificationAction = await Notifications.info(
      `Content type ${contentTypeName} has been ${overrideBool ? `updated` : `generated`}.`,
      configPath && (await existsAsync(configPath)) ? `Open settings` : undefined
    );

    if (notificationAction === 'Open settings' && configPath && (await existsAsync(configPath))) {
      commands.executeCommand('vscode.open', Uri.file(configPath));
    }
  }

  /**
   * Add missing fields to the content type
   */
  public static async addMissingFields() {
    if (!(await ContentType.verify())) {
      return;
    }

    Telemetry.send(TelemetryEvent.addMissingFields);

    const content = ArticleHelper.getCurrent();

    if (!content || !content.data) {
      Notifications.warning(`No front matter data found to add missing fields.`);
      return;
    }

    const contentType = ArticleHelper.getContentType(content?.data);
    const updatedFields = ContentType.generateFields(content.data, contentType.fields);

    const contentTypes = ContentType.getAll() || [];
    const index = contentTypes.findIndex((ct) => ct.name === contentType.name);
    contentTypes[index].fields = updatedFields;

    await Settings.update(SETTING_TAXONOMY_CONTENT_TYPES, contentTypes, true);

    const configPath = Settings.projectConfigPath;
    const notificationAction = await Notifications.info(
      `Content type ${contentType.name} has been updated.`,
      configPath && (await existsAsync(configPath)) ? `Open settings` : undefined
    );

    if (notificationAction === 'Open settings' && configPath && (await existsAsync(configPath))) {
      commands.executeCommand('vscode.open', Uri.file(configPath));
    }
  }

  /**
   * Set the content type to be used for the current file
   */
  public static async setContentType() {
    if (!(await ContentType.verify())) {
      return;
    }

    Telemetry.send(TelemetryEvent.setContentType);

    const content = ArticleHelper.getCurrent();
    const contentTypes = ContentType.getAll() || [];

    if (!content || !content.data) {
      Notifications.warning(`No front matter data found to set the content type.`);
      return;
    }

    const ctAnswer = await window.showQuickPick(
      contentTypes.map((ct) => ct.name),
      {
        title: 'Select the content type',
        ignoreFocusOut: true,
        placeHolder: 'Which content type would you like to use?'
      }
    );

    if (!ctAnswer) {
      return;
    }

    content.data.type = ctAnswer;

    const editor = window.activeTextEditor;
    ArticleHelper.update(editor!, content);
  }

  /**
   * Retrieve the field value
   * @param data
   * @param parents
   * @returns
   */
  public static getFieldValue(data: any, parents: string[]): string | string[] {
    let fieldValue = [];
    let crntPageData = data;

    for (let i = 0; i < parents.length; i++) {
      const crntField = parents[i];

      if (i === parents.length - 1) {
        fieldValue = crntPageData[crntField];
      } else {
        if (!crntPageData[crntField]) {
          continue;
        }

        crntPageData = crntPageData[crntField];
      }
    }

    return fieldValue;
  }

  /**
   * Set the field value
   * @param data
   * @param parents
   * @returns
   */
  public static setFieldValue(data: any, parents: string[], value: any) {
    let crntPageData = data;

    for (let i = 0; i < parents.length; i++) {
      const crntField = parents[i];

      if (i === parents.length - 1) {
        crntPageData[crntField] = value;
      } else {
        if (!crntPageData[crntField]) {
          continue;
        }

        crntPageData = crntPageData[crntField];
      }
    }

    return data;
  }

  /**
   * Find the field by its type
   * @param fields
   * @param type
   * @param parents
   * @returns
   */
  public static findFieldByType(
    fields: Field[],
    type: FieldType,
    parents: string[] = []
  ): string[] {
    for (const field of fields) {
      if (field.type === type) {
        parents = [...parents, field.name];
        return parents;
      } else if (field.type === 'fields' && field.fields) {
        const subFields = this.findFieldByType(field.fields, type, parents);
        if (subFields.length > 0) {
          return [...parents, field.name, ...subFields];
        }
      }
    }

    return parents;
  }

  /**
   * Find the preview field in the fields
   * @param ctFields
   * @param parents
   * @returns
   */
  public static findPreviewField(ctFields: Field[], parents: string[] = []): string[] {
    for (const field of ctFields) {
      if (field.isPreviewImage && field.type === 'image') {
        parents = [...parents, field.name];
        return parents;
      } else if (field.type === 'fields' && field.fields) {
        const subFields = this.findPreviewField(field.fields);
        if (subFields.length > 0) {
          return [...parents, field.name, ...subFields];
        }
      } else if (field.type === 'block') {
        const subFields = this.findPreviewInBlockField(field);
        if (subFields.length > 0) {
          return [...parents, field.name, ...subFields];
        }
      }
    }

    return parents;
  }

  /**
   * Find the required fields
   */
  public static findEmptyRequiredFields(article: ParsedFrontMatter): Field[][] | undefined {
    const contentType = ArticleHelper.getContentType(article.data);
    if (!contentType) {
      return;
    }

    const allRequiredFields = ContentType.findRequiredFieldsDeep(contentType.fields);

    let emptyFields: Field[][] = [];

    for (const fields of allRequiredFields) {
      const fieldValue = this.getFieldValue(
        article.data,
        fields.map((f) => f.name)
      );
      if (
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === '' ||
        fieldValue.length === 0 ||
        fieldValue === DefaultFieldValues.faultyCustomPlaceholder
      ) {
        emptyFields.push(fields);
      }
    }

    return emptyFields || [];
  }

  /**
   * Find all the required fields in the content type
   * @param fields
   * @param parents
   * @returns
   */
  private static findRequiredFieldsDeep(
    fields: Field[],
    parents: Field[][] = [],
    parentFields: Field[] = []
  ): Field[][] {
    for (const field of fields) {
      if (field.required) {
        parents.push([...parentFields, field]);
      }

      if (field.type === 'fields' && field.fields) {
        this.findRequiredFieldsDeep(field.fields, parents, [...parentFields, field]);
      }
    }

    return parents;
  }

  /**
   * Look for the preview image in the block field
   * @param field
   * @param parents
   * @returns
   */
  private static findPreviewInBlockField(field: Field) {
    const groups =
      field.fieldGroup && Array.isArray(field.fieldGroup) ? field.fieldGroup : [field.fieldGroup];
    if (!groups) {
      return [];
    }

    const blocks = Settings.get<FieldGroup[]>(SETTING_TAXONOMY_FIELD_GROUPS);
    if (!blocks) {
      return [];
    }

    let found = false;
    for (const group of groups) {
      const block = blocks.find((block) => block.id === group);
      if (!block) {
        continue;
      }

      let newParents: string[] = [];
      if (!found) {
        newParents = this.findPreviewField(block?.fields, []);
      }

      if (newParents.length > 0) {
        found = true;
        return newParents;
      }
    }

    return [];
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

      if (fields.some((f) => f.name === field)) {
        continue;
      }

      if (field.toLowerCase() === 'tag' || field.toLowerCase() === 'tags') {
        fields.push({
          title: field,
          name: field,
          type: 'tags'
        } as Field);
      } else if (field.toLowerCase() === 'category' || field.toLowerCase() === 'categories') {
        fields.push({
          title: field,
          name: field,
          type: 'categories'
        } as Field);
      } else if (
        fieldData &&
        fieldData instanceof Array &&
        fieldData.length > 0 &&
        typeof fieldData[0] === 'string'
      ) {
        fields.push({
          title: field,
          name: field,
          type: 'choice',
          choices: fieldData
        } as Field);
      } else if (
        fieldData &&
        fieldData instanceof Array &&
        fieldData.length > 0 &&
        typeof fieldData[0] === 'object'
      ) {
        const newFields = ContentType.generateFields(fieldData);
        fields.push({
          title: field,
          name: field,
          type: 'block',
          fields: newFields
        } as Field);
      } else if (fieldData && fieldData instanceof Object) {
        const newFields = ContentType.generateFields(fieldData);
        fields.push({
          title: field,
          name: field,
          type: 'fields',
          fields: newFields
        } as Field);
      } else {
        if (field.toLowerCase().includes('image')) {
          fields.push({
            title: field,
            name: field,
            type: 'image'
          } as Field);
        } else if (typeof fieldData === 'number') {
          fields.push({
            title: field,
            name: field,
            type: 'number'
          } as Field);
        } else if (!isNaN(new Date(fieldData).getDate())) {
          fields.push({
            title: field,
            name: field,
            type: 'datetime'
          } as Field);
        } else if (field.toLowerCase() === 'draft') {
          fields.push({
            title: field,
            name: field,
            type: 'draft'
          } as Field);
        } else if (field.toLowerCase() === 'slug') {
          // Do nothing
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
    window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: 'Front Matter: Creating content...',
        cancellable: false
      },
      async () => {
        let titleValue = await Questions.ContentTitle();
        if (!titleValue) {
          return;
        }

        titleValue = titleValue.trim();
        // Check if the title needs to encode the emoji's used in it
        const titleField = contentType.fields.find((f) => f.name === 'title');
        if (titleField && titleField.encodeEmoji) {
          titleValue = encodeEmoji(titleValue);
        }

        let templatePath = contentType.template;
        let templateData: ParsedFrontMatter | null = null;
        if (templatePath) {
          templatePath = Folders.getAbsFilePath(templatePath);
          templateData = await ArticleHelper.getFrontMatterByPath(templatePath);
        }

        let newFilePath: string | undefined = await ArticleHelper.createContent(
          contentType,
          folderPath,
          titleValue
        );
        if (!newFilePath) {
          return;
        }

        if (contentType.name === 'default') {
          const crntFramework = Settings.get<string>(SETTING_FRAMEWORK_ID);
          if (crntFramework?.toLowerCase() === 'jekyll') {
            const idx = contentType.fields.findIndex((f) => f.name === 'draft');
            if (idx > -1) {
              contentType.fields.splice(idx, 1);
            }
          }
        }

        let data: any = await this.processFields(
          contentType,
          titleValue,
          templateData?.data || {},
          newFilePath
        );

        data = ArticleHelper.updateDates(Object.assign({}, data));

        if (contentType.name !== DEFAULT_CONTENT_TYPE_NAME) {
          data['type'] = contentType.name;
        }

        const content = ArticleHelper.stringifyFrontMatter(templateData?.content || ``, data);

        await writeFileAsync(newFilePath, content, { encoding: 'utf8' });

        // Check if the content type has a post script to execute
        if (contentType.postScript) {
          const scripts = await CustomScript.getScripts();
          const script = scripts.find((s) => s.id === contentType.postScript);

          if (script && (script.type === ScriptType.Content || !script?.type)) {
            await CustomScript.run(script, newFilePath);

            const doc = await workspace.openTextDocument(Uri.file(newFilePath));
            await doc.save();
          }
        }

        await commands.executeCommand('vscode.open', Uri.file(newFilePath));

        Notifications.info(`Your new content has been created.`);

        Telemetry.send(TelemetryEvent.createContentFromContentType);

        // Trigger a refresh for the dashboard
        PagesListener.refresh();
      }
    );
  }

  /**
   * Process all content type fields
   * @param contentType
   * @param data
   */
  private static async processFields(
    obj: IContentType | Field,
    titleValue: string,
    data: any,
    filePath: string,
    isRoot: boolean = true
  ): Promise<any> {
    if (obj.fields) {
      const dateFormat = Settings.get(SETTING_DATE_FORMAT) as string;

      for (const field of obj.fields) {
        if (field.name === 'title') {
          if (field.default) {
            data[field.name] = processKnownPlaceholders(field.default, titleValue, dateFormat);
            data[field.name] = await ArticleHelper.processCustomPlaceholders(
              data[field.name],
              titleValue,
              filePath
            );
          } else if (isRoot) {
            data[field.name] = titleValue;
          } else {
            data[field.name] = '';
          }
        } else {
          if (field.type === 'fields') {
            data[field.name] = await this.processFields(field, titleValue, {}, filePath, false);
          } else {
            const defaultValue = field.default;

            if (typeof defaultValue === 'string') {
              data[field.name] = processKnownPlaceholders(defaultValue, titleValue, dateFormat);
              data[field.name] = await ArticleHelper.processCustomPlaceholders(
                data[field.name],
                titleValue,
                filePath
              );
            } else if (typeof defaultValue !== 'undefined') {
              data[field.name] = defaultValue;
            } else {
              const draftField = ContentType.getDraftField();

              if (
                field.type === 'draft' &&
                (draftField?.type === 'boolean' || draftField?.type === undefined)
              ) {
                data[field.name] = true;
              } else {
                // Check the field types
                switch (field.type) {
                  case 'choice':
                    if (field.multiple) {
                      data[field.name] = [];
                    } else {
                      data[field.name] = '';
                    }
                    break;
                  case 'boolean':
                    data[field.name] = false;
                    break;
                  case 'number':
                    data[field.name] = 0;
                    break;
                  case 'datetime':
                    data[field.name] = null;
                    break;
                  case 'list':
                  case 'tags':
                  case 'categories':
                  case 'taxonomy':
                    data[field.name] = [];
                    break;
                  case 'string':
                  case 'image':
                  case 'file':
                  default:
                    data[field.name] = '';
                    break;
                }
              }
            }
          }
        }
      }
    }

    return data;
  }

  /**
   * Verify if the content type feature is enabled
   * @returns
   */
  private static async verify() {
    const hasFeature = await ModeListener.hasFeature(FEATURE_FLAG.panel.contentType);
    if (!hasFeature) {
      Notifications.warning(`The content type actions are not available in this mode.`);
      return false;
    }

    return true;
  }
}
