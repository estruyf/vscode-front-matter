const extensionName = "frontMatter";

export const EXTENSION_ID = 'eliostruyf.vscode-front-matter';
export const EXTENSION_BETA_ID = 'eliostruyf.vscode-front-matter-beta';

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
  dashboardClose: getCommandName("dashboard.close"),
  promote: getCommandName("promoteSettings"),
  insertImage: getCommandName("insertImage"),
  createFolder: getCommandName("createFolder"),
  diagnostics: getCommandName("diagnostics"),

  // WYSIWYG
  bold: getCommandName("markup.bold"),
  italic: getCommandName("markup.italic"),
  strikethrough: getCommandName("markup.strikethrough"),
  code: getCommandName("markup.code"),
  codeblock: getCommandName("markup.codeblock"),
  heading: getCommandName("markup.heading"),
  blockquote: getCommandName("markup.blockquote"),
  unorderedlist: getCommandName("markup.unorderedlist"),
  orderedlist: getCommandName("markup.orderedlist"),
  taskList: getCommandName("markup.tasklist"),
  options: getCommandName("markup.options"),
};