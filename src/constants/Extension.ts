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
  initTemplate: getCommandName("initTemplate"),
  collapseSections: getCommandName("collapseSections"),
  preview: getCommandName("preview"),
  dashboard: getCommandName("dashboard"),
  dashboardMedia: getCommandName("dashboard.media"),
  dashboardSnippets: getCommandName("dashboard.snippets"),
  dashboardData: getCommandName("dashboard.data"),
  dashboardTaxonomy: getCommandName("dashboard.taxonomy"),
  dashboardClose: getCommandName("dashboard.close"),
  promote: getCommandName("promoteSettings"),
  createFolder: getCommandName("createFolder"),
  diagnostics: getCommandName("diagnostics"),
  modeSwitch: getCommandName("mode.switch"),

  showOutputChannel: getCommandName("showOutputChannel"),

  // Insert dashboards
  insertMedia: getCommandName("insertMedia"),
  insertSnippet: getCommandName("insertSnippet"),

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

  // Content types
  generateContentType: getCommandName("contenttype.generate"),
  addMissingFields: getCommandName("contenttype.addMissingFields"),
  setContentType: getCommandName("contenttype.setContentType"),

  // Git
  gitSync: getCommandName("git.sync"),

  // Authenticate
  authenticate: getCommandName("authenticate"),

  // Config
  reloadConfig: getCommandName("config.reload"),
};