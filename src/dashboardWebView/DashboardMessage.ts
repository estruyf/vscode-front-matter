export enum DashboardMessage {
  getViewType = 'getViewType',
  reload = 'reload',
  setPageViewType = 'setPageViewType',
  getMode = 'getMode',
  showWarning = 'showWarning',

  // Project switching
  switchProject = 'switchProject',

  // Welcome view
  initializeProject = 'initializeProject',
  setFramework = 'setFramework',
  addFolder = 'addFolder',
  addAssetsFolder = 'addAssetsFolder',
  triggerTemplate = 'triggerTemplate',
  ssgGetAstroContentTypes = 'ssgGetAstroContentTypes',
  ssgSetAstroContentTypes = 'ssgSetAstroContentTypes',

  // Content dashboard
  getData = 'getData',
  createContent = 'createContent',
  createByContentType = 'createByContentType',
  createByTemplate = 'createByTemplate',
  refreshPages = 'refreshPages',
  searchPages = 'searchPages',
  openFile = 'openFile',
  deleteFile = 'deleteFile',
  getPinnedItems = 'getPinnedItems',
  pinItem = 'pinItem',
  unpinItem = 'unpinItem',

  // Media Dashboard
  getMedia = 'getMedia',
  copyToClipboard = 'copyToClipboard',
  refreshMedia = 'refreshMedia',
  uploadMedia = 'uploadMedia',
  deleteMedia = 'deleteMedia',
  revealMedia = 'revealMedia',
  insertMedia = 'insertMedia',
  updateMediaMetadata = 'updateMediaMetadata',
  createMediaFolder = 'createMediaFolder',
  insertFile = 'insertFile',
  createHexoAssetFolder = 'createHexoAssetFolder',
  getUnmappedMedia = 'getUnmappedMedia',
  remapMediaMetadata = 'remapMediaMetadata',

  // Data dashboard
  getDataEntries = 'getDataEntries',
  putDataEntries = 'putDataEntries',

  // Snippets dashboard
  insertSnippet = 'insertSnippet',
  addSnippet = 'addSnippet',
  updateSnippet = 'updateSnippet',

  // Taxonomy dashboard
  getTaxonomyData = 'getTaxonomyData',
  editTaxonomy = 'editTaxonomy',
  mergeTaxonomy = 'mergeTaxonomy',
  deleteTaxonomy = 'deleteTaxonomy',
  addToTaxonomy = 'addToTaxonomy',
  createTaxonomy = 'createTaxonomy',
  importTaxonomy = 'importTaxonomy',
  moveTaxonomy = 'moveTaxonomy',

  // Other
  getTheme = 'getTheme',
  updateSetting = 'updateSetting',
  setState = 'setState',
  runCustomScript = 'runCustomScript',
  sendTelemetry = 'sendTelemetry',
  logError = 'logError'
}
