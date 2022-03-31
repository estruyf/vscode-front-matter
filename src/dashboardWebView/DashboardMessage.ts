export enum DashboardMessage {
  getViewType = 'getViewType',
  reload = 'reload',
  setPageViewType = 'setPageViewType',
  getMode = 'getMode',

  // Content dashboard
  getData = 'getData',
  createContent = 'createContent',
  createByContentType = 'createByContentType',
  createByTemplate = 'createByTemplate',
  refreshPages = 'refreshPages',
  searchPages = 'searchPages',
  openFile = 'openFile',
  deleteFile = 'deleteFile',

  // Media Dashboard
  getMedia = 'getMedia',
  copyToClipboard = 'copyToClipboard',
  refreshMedia = 'refreshMedia',
  uploadMedia = 'uploadMedia',
  deleteMedia = 'deleteMedia',
  revealMedia = 'revealMedia',
  insertPreviewImage = 'insertPreviewImage',
  updateMediaMetadata = 'updateMediaMetadata',
  createMediaFolder = 'createMediaFolder',

  // Data dashboard
  getDataEntries = 'getDataEntries',
  putDataEntries = 'putDataEntries',

  // Snippets dashboard
  insertSnippet = 'insertSnippet',
  addSnippet = 'addSnippet',
  updateSnippet = 'updateSnippet',

  // Other
  getTheme = 'getTheme',
  updateSetting = 'updateSetting',
  initializeProject = 'initializeProject',
  setFramework = 'setFramework',
  setState = 'setState',
  runCustomScript = 'runCustomScript',
  sendTelemetry = 'sendTelemetry',
}