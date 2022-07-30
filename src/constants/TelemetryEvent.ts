export const TelemetryEvent = {
  activate: 'activate',
  initialization: 'initialization',
  registerFolder: 'registerFolder',
  unregisterFolder: 'unregisterFolder',
  promoteSettings: 'promoteSettings',

  // Commands
  openContentDashboard: 'openContentDashboard',
  openMediaDashboard: 'openMediaDashboard',
  openDataDashboard: 'openDataDashboard',
  openSnippetsDashboard: 'openSnippetsDashboard',
  openTaxonomyDashboard: 'openTaxonomyDashboard',
  closeDashboard: 'closeDashboard',

  // Other actions
  generateSlug: 'generateSlug',
  createContentFromTemplate: 'createContentFromTemplate',
  createContentFromContentType: 'createContentFromContentType',
  addMediaFolder: 'addMediaFolder',
  openPreview: 'openPreview',
  uploadMedia: 'uploadMedia',
  refreshMedia: 'refreshMedia',
  deleteMedia: 'deleteMedia',
  insertMediaToContent: 'insertMediaToContent',
  insertFileToContent: 'insertFileToContent',
  updateMediaMetadata: 'updateMediaMetadata',
  openExplorerView: 'openExplorerView',

  // Content types
  generateContentType: 'generateContentType',
  addMissingFields: 'addMissingFields',
  setContentType: 'setContentType',

  // Custom scripts
  runCustomScript: 'runCustomScript',
  runMediaScript: 'runMediaScript',

  // Webviews
  webviewWelcomeScreen: 'webviewWelcomeScreen',
  webviewMediaView: 'webviewMediaView',
  webviewDataView: 'webviewDataView',
  webviewContentsView: 'webviewContentsView',
  webviewSnippetsView: 'webviewSnippetsView',
  webviewTaxonomyDashboard: 'webviewTaxonomyDashboard',

  // Git
  gitSync: 'gitSync',
};