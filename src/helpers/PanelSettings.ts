import { workspace } from "vscode"
import { Extension, Settings } from "."
import { Dashboard } from "../commands/Dashboard"
import { Preview } from "../commands/Preview"
import { Template } from "../commands/Template"
import { CONTEXT, DefaultFields, SETTINGS_CONTENT_DRAFT_FIELD, SETTINGS_CONTENT_FRONTMATTER_HIGHLIGHT, SETTINGS_DATA_TYPES, SETTINGS_FRAMEWORK_ID, SETTINGS_FRAMEWORK_START, SETTING_AUTO_UPDATE_DATE, SETTING_COMMA_SEPARATED_FIELDS, SETTING_CUSTOM_SCRIPTS, SETTING_DATE_FORMAT, SETTING_PANEL_FREEFORM, SETTING_SEO_CONTENT_MIN_LENGTH, SETTING_SEO_DESCRIPTION_FIELD, SETTING_SEO_DESCRIPTION_LENGTH, SETTING_SEO_SLUG_LENGTH, SETTING_SEO_TITLE_LENGTH, SETTING_SLUG_PREFIX, SETTING_SLUG_SUFFIX, SETTING_SLUG_UPDATE_FILE_NAME, SETTING_TAXONOMY_CATEGORIES, SETTING_TAXONOMY_CONTENT_TYPES, SETTING_TAXONOMY_CUSTOM, SETTING_TAXONOMY_TAGS } from "../constants"
import { CustomScript, DataType, DraftField, PanelSettings as IPanelSettings, ScriptType } from "../models"

export class PanelSettings {

  public static async get(): Promise<IPanelSettings> {
    return {
      seo: {
        title: Settings.get(SETTING_SEO_TITLE_LENGTH) as number || -1,
        slug: Settings.get(SETTING_SEO_SLUG_LENGTH) as number || -1,
        description: Settings.get(SETTING_SEO_DESCRIPTION_LENGTH) as number || -1,
        content: Settings.get(SETTING_SEO_CONTENT_MIN_LENGTH) as number || -1,
        descriptionField: Settings.get(SETTING_SEO_DESCRIPTION_FIELD) as string || DefaultFields.Description
      },
      slug: {
        prefix: Settings.get(SETTING_SLUG_PREFIX) || "",
        suffix: Settings.get(SETTING_SLUG_SUFFIX) || "",
        updateFileName: !!Settings.get<boolean>(SETTING_SLUG_UPDATE_FILE_NAME),
      },
      date: {
        format: Settings.get<string>(SETTING_DATE_FORMAT) || ""
      },
      tags: Settings.get(SETTING_TAXONOMY_TAGS, true) || [],
      categories: Settings.get(SETTING_TAXONOMY_CATEGORIES, true) || [],
      customTaxonomy: Settings.get(SETTING_TAXONOMY_CUSTOM, true) || [],
      freeform: Settings.get(SETTING_PANEL_FREEFORM),
      scripts: (Settings.get<CustomScript[]>(SETTING_CUSTOM_SCRIPTS) || []).filter(s => s.type === ScriptType.Content || !s.type),
      isInitialized: await Template.isInitialized(),
      modifiedDateUpdate: Settings.get(SETTING_AUTO_UPDATE_DATE) || false,
      writingSettingsEnabled: this.isWritingSettingsEnabled() || false,
      fmHighlighting: Settings.get(SETTINGS_CONTENT_FRONTMATTER_HIGHLIGHT),
      preview: Preview.getSettings(),
      commaSeparatedFields: Settings.get(SETTING_COMMA_SEPARATED_FIELDS) || [],
      contentTypes: Settings.get(SETTING_TAXONOMY_CONTENT_TYPES) || [],
      dashboardViewData: Dashboard.viewData,
      draftField: Settings.get<DraftField>(SETTINGS_CONTENT_DRAFT_FIELD),
      isBacker: await Extension.getInstance().getState<boolean | undefined>(CONTEXT.backer, 'global'),
      framework: Settings.get<string>(SETTINGS_FRAMEWORK_ID),
      commands: {
        start: Settings.get<string>(SETTINGS_FRAMEWORK_START)
      },
      dataTypes: Settings.get<DataType[]>(SETTINGS_DATA_TYPES),
    }
  }

  /**
   * Check if the writing settings are enabled
   */
  public static isWritingSettingsEnabled(): boolean {
    const config = workspace.getConfiguration("", { languageId: "markdown" });
    
    const fontSize = config.get("editor.fontSize");
    const lineHeight = config.get("editor.lineHeight");
    const wordWrap = config.get("editor.wordWrap");
    const wordWrapColumn = config.get("editor.wordWrapColumn");
    const lineNumbers = config.get("editor.lineNumbers");
    const quickSuggestions = config.get<boolean>("editor.quickSuggestions");

    return( fontSize && lineHeight && wordWrap && wordWrapColumn && lineNumbers && quickSuggestions !== undefined) as boolean;
  }
}