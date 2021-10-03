const extensionName = "frontMatter";

export const EXTENSION_ID = 'eliostruyf.vscode-front-matter';
export const EXTENSION_BETA_ID = 'eliostruyf.vscode-front-matter-beta';

export const EXTENSION_STATE_VERSION = 'frontMatter:Version';
export const EXTENSION_STATE_PAGES_VIEW = 'frontMatter:Pages:ViewType';

export const getCommandName = (command: string) => {
  return `${extensionName}.${command}`;
};

export const COMMAND_NAME = {
  init: getCommandName("init"),
  insertTags: getCommandName("insertTags"),
  insertCategories: getCommandName("insertCategories"),
  createTag: getCommandName("createTag"),
  createCategory: getCommandName("createCategory"),
  exportTaxonomy: getCommandName("exportTaxonomy"),
  remap: getCommandName("remap"),
  setLastModifiedDate: getCommandName("setLastModifiedDate"),
  generateSlug: getCommandName("generateSlug"),
  createFromTemplate: getCommandName("createFromTemplate"),
  toggleDraft: getCommandName("toggleDraft"),
  registerFolder: getCommandName("registerFolder"),
  unregisterFolder: getCommandName("unregisterFolder"),
  createContent: getCommandName("createContent"),
  createByContentType: getCommandName("createByContentType"),
  createByTemplate: getCommandName("createByTemplate"),
  createTemplate: getCommandName("createTemplate"),
  collapseSections: getCommandName("collapseSections"),
  preview: getCommandName("preview"),
  dashboard: getCommandName("dashboard"),
  promote: getCommandName("promoteSettings"),
  insertImage: getCommandName("insertImage"),
};