import {
  SETTING_PANEL_ACTIONS_DISABLED,
  SETTING_SPONSORS_AI_ENABLED,
  SETTING_WEBSITE_URL
} from './../constants/settings';
import { workspace } from 'vscode';
import { ContentType, Extension, Settings, TaxonomyHelper } from '.';
import { Dashboard } from '../commands/Dashboard';
import { Preview } from '../commands/Preview';
import { Project } from '../commands/Project';
import {
  CONTEXT,
  DefaultFields,
  SETTING_CONTENT_DRAFT_FIELD,
  SETTING_CONTENT_FRONTMATTER_HIGHLIGHT,
  SETTING_DATA_TYPES,
  SETTING_FRAMEWORK_ID,
  SETTING_FRAMEWORK_START,
  SETTING_AUTO_UPDATE_DATE,
  SETTING_COMMA_SEPARATED_FIELDS,
  SETTING_CUSTOM_SCRIPTS,
  SETTING_DATE_FORMAT,
  SETTING_PANEL_FREEFORM,
  SETTING_SEO_CONTENT_MIN_LENGTH,
  SETTING_SEO_DESCRIPTION_FIELD,
  SETTING_SEO_DESCRIPTION_LENGTH,
  SETTING_SEO_SLUG_LENGTH,
  SETTING_SEO_TITLE_LENGTH,
  SETTING_SLUG_PREFIX,
  SETTING_SLUG_SUFFIX,
  SETTING_SLUG_UPDATE_FILE_NAME,
  SETTING_TAXONOMY_CUSTOM,
  SETTING_TAXONOMY_FIELD_GROUPS,
  SETTING_SEO_TITLE_FIELD
} from '../constants';
import { GitListener } from '../listeners/general';
import {
  CustomScript,
  DataType,
  DraftField,
  FieldGroup,
  PanelSettings as IPanelSettings,
  PanelAction,
  ScriptType,
  TaxonomyType
} from '../models';
import { Folders } from '../commands';

export class PanelSettings {
  public static async get(): Promise<IPanelSettings> {
    return {
      aiEnabled: Settings.get<boolean>(SETTING_SPONSORS_AI_ENABLED) || false,
      git: await GitListener.getSettings(),
      seo: {
        title: (Settings.get(SETTING_SEO_TITLE_LENGTH) as number) || -1,
        slug: (Settings.get(SETTING_SEO_SLUG_LENGTH) as number) || -1,
        description: (Settings.get(SETTING_SEO_DESCRIPTION_LENGTH) as number) || -1,
        content: (Settings.get(SETTING_SEO_CONTENT_MIN_LENGTH) as number) || -1,
        titleField: (Settings.get(SETTING_SEO_TITLE_FIELD) as string) || DefaultFields.Title,
        descriptionField:
          (Settings.get(SETTING_SEO_DESCRIPTION_FIELD) as string) || DefaultFields.Description
      },
      slug: {
        prefix: Settings.get(SETTING_SLUG_PREFIX) || '',
        suffix: Settings.get(SETTING_SLUG_SUFFIX) || '',
        updateFileName: !!Settings.get<boolean>(SETTING_SLUG_UPDATE_FILE_NAME)
      },
      date: {
        format: Settings.get<string>(SETTING_DATE_FORMAT) || ''
      },
      tags: (await TaxonomyHelper.get(TaxonomyType.Tag)) || [],
      categories: (await TaxonomyHelper.get(TaxonomyType.Category)) || [],
      customTaxonomy: Settings.get(SETTING_TAXONOMY_CUSTOM, true) || [],
      freeform: Settings.get(SETTING_PANEL_FREEFORM),
      scripts: (Settings.get<CustomScript[]>(SETTING_CUSTOM_SCRIPTS) || []).filter(
        (s) => (s.type === ScriptType.Content || !s.type) && !s.hidden
      ),
      isInitialized: await Project.isInitialized(),
      modifiedDateUpdate: Settings.get(SETTING_AUTO_UPDATE_DATE) || false,
      writingSettingsEnabled: this.isWritingSettingsEnabled() || false,
      fmHighlighting: Settings.get(SETTING_CONTENT_FRONTMATTER_HIGHLIGHT),
      preview: Preview.getSettings(),
      commaSeparatedFields: Settings.get(SETTING_COMMA_SEPARATED_FIELDS) || [],
      contentTypes: ContentType.getAll() || [],
      dashboardViewData: Dashboard.viewData,
      draftField: Settings.get<DraftField>(SETTING_CONTENT_DRAFT_FIELD),
      isBacker: await Extension.getInstance().getState<boolean | undefined>(
        CONTEXT.backer,
        'global'
      ),
      framework: Settings.get<string>(SETTING_FRAMEWORK_ID),
      commands: {
        start: Settings.get<string>(SETTING_FRAMEWORK_START)
      },
      dataTypes: Settings.get<DataType[]>(SETTING_DATA_TYPES),
      fieldGroups: Settings.get<FieldGroup[]>(SETTING_TAXONOMY_FIELD_GROUPS),
      contentFolders: Folders.get(),
      websiteUrl: Settings.get<string>(SETTING_WEBSITE_URL) || '',
      disabledActions: Settings.get<PanelAction[]>(SETTING_PANEL_ACTIONS_DISABLED) || []
    };
  }

  /**
   * Check if the writing settings are enabled
   */
  public static isWritingSettingsEnabled(): boolean {
    const config = workspace.getConfiguration('', { languageId: 'markdown' });

    const fontSize = config.get('editor.fontSize');
    const lineHeight = config.get('editor.lineHeight');
    const wordWrap = config.get('editor.wordWrap');
    const wordWrapColumn = config.get('editor.wordWrapColumn');
    const lineNumbers = config.get('editor.lineNumbers');
    const quickSuggestions = config.get<boolean>('editor.quickSuggestions');

    return (fontSize &&
      lineHeight &&
      wordWrap &&
      wordWrapColumn &&
      lineNumbers &&
      quickSuggestions !== undefined) as boolean;
  }
}
