import { ImageHelper } from './../../helpers/ImageHelper';
import { Folders } from "../../commands/Folders";
import { Command } from "../../panelWebView/Command";
import { CommandToCode } from "../../panelWebView/CommandToCode";
import { BaseListener } from "./BaseListener";
import { commands, ThemeIcon, window } from 'vscode';
import { ArticleHelper, Settings } from "../../helpers";
import { COMMAND_NAME, DefaultFields, SETTING_COMMA_SEPARATED_FIELDS, SETTING_TAXONOMY_CONTENT_TYPES } from "../../constants";
import { Article } from '../../commands';

const FILE_LIMIT = 10;

export class DataListener extends BaseListener {

  /**
   * Process the messages for the dashboard views
   * @param msg 
   */
  public static process(msg: { command: CommandToCode, data: any }) {
    super.process(msg);

    switch(msg.command) {
      case CommandToCode.getData:
        this.getFoldersAndFiles();
        this.getFileData();
        break;
      case CommandToCode.createContent:
        commands.executeCommand(COMMAND_NAME.createContent);
        break;
      case CommandToCode.createTemplate:
        commands.executeCommand(COMMAND_NAME.createTemplate);
        break;
      case CommandToCode.updateMetadata:
        this.updateMetadata(msg.data);
        break;
      case CommandToCode.frameworkCommand:
        this.openTerminalWithCommand(msg.data.command);
        break;
    }
  }

  /**
   * Retrieve the information about the registered folders and its files
   */
  public static async getFoldersAndFiles() {
    const folders = await Folders.getInfo(FILE_LIMIT) || null;

    this.sendMsg(Command.folderInfo, folders);
  }

  /**
   * Triggers a metadata change in the panel
   * @param metadata 
   */
   public static pushMetadata(metadata: any) {
    const wsFolder = Folders.getWorkspaceFolder();
    const filePath = window.activeTextEditor?.document.uri.fsPath;
    const commaSeparated = Settings.get<string[]>(SETTING_COMMA_SEPARATED_FIELDS);
    const contentTypes = Settings.get<string>(SETTING_TAXONOMY_CONTENT_TYPES);
    
    const articleDetails = ArticleHelper.getDetails();

    if (articleDetails) {
      metadata.articleDetails = articleDetails;
    }

    let updatedMetadata = Object.assign({}, metadata);
    if (commaSeparated) {
      for (const key of commaSeparated) {
        if (updatedMetadata[key] && typeof updatedMetadata[key] === "string") {
          updatedMetadata[key] = updatedMetadata[key].split(",").map((s: string) => s.trim());
        }
      }
    }

    const keys = Object.keys(updatedMetadata);
    if (keys.length > 0) {
      updatedMetadata.filePath = filePath;
    }

    if (keys.length > 0 && contentTypes && wsFolder) {
      // Get the current content type
      const contentType = ArticleHelper.getContentType(updatedMetadata);
      if (contentType) {
        ImageHelper.processImageFields(updatedMetadata, contentType.fields)
      }
    }

    // Check slug
    if (!updatedMetadata[DefaultFields.Slug]) {
      const slug = Article.getSlug();

      if (slug) {
        updatedMetadata[DefaultFields.Slug] = slug;
      }
    }

    this.sendMsg(Command.metadata, updatedMetadata);
  }

  /**
   * Update the metadata of the article
   */
  public static async updateMetadata({field, parents, value }: { field: string, value: any, parents?: string[], fieldData?: { multiple: boolean, value: string[] } }) {
    if (!field) {
      return;
    }

    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (!article) {
      return;
    }

    const contentType = ArticleHelper.getContentType(article.data);
    const dateFields = contentType.fields.filter((field) => field.type === "datetime");
    const imageFields = contentType.fields.filter((field) => field.type === "image" && field.multiple);

    // Support multi-level fields
    let parentObj = article.data;
    for (const parent of parents || []) {
      // If parent doesn't yet exists, it needs to be created
      if (!parentObj[parent]) {
        parentObj[parent] = {};
      }

      parentObj = parentObj[parent];
    }

    for (const dateField of dateFields) {
      if ((field === dateField.name) && value) {
        parentObj[field] = Article.formatDate(new Date(value));
      } else if (!imageFields.find(f => f.name === field)) {
        // Only override the field data if it is not an multiselect image field
        parentObj[field] = value;
      }
    }

    for (const imageField of imageFields) {
      if (field === imageField.name) {
        // If value is an array, it means it comes from the explorer view itself (deletion)
        if (Array.isArray(value)) {
          parentObj[field] = value || [];
        } else { // Otherwise it is coming from the media dashboard (addition)
          let fieldValue = parentObj[field];
          if (fieldValue && !Array.isArray(fieldValue)) {
            fieldValue = [fieldValue];
          }
          const crntData = Object.assign([], fieldValue);
          const allRelPaths = [...(crntData || []), value];
          parentObj[field] = [...new Set(allRelPaths)].filter(f => f);
        }
      }
    }
    
    ArticleHelper.update(editor, article);
    this.pushMetadata(article.data);
  }

  /**
   * Retrieve the file its front matter
   */
  public static async getFileData() {
    const editor = window.activeTextEditor;
    if (!editor) {
      return "";
    }

    const article = ArticleHelper.getFrontMatter(editor);
    if (article?.data) {
      this.pushMetadata(article!.data);
    }
  }

  /**
   * Open a terminal and run the passed command
   * @param command 
   */
  private static openTerminalWithCommand(command: string) {
    if (command) {
      let terminal = window.activeTerminal;
  
      if (!terminal || (terminal && terminal.state.isInteractedWith === true)) {
        terminal = window.createTerminal({
          name: `Starting local server`,
          iconPath: new ThemeIcon('server-environment'),
          message: `Starting local server`,
        });
      }
  
      if (terminal) {
        terminal.sendText(command);
        terminal.show(false);
      }
    }
  }
}