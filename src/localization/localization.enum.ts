export enum LocalizationKey {
  /**
   * Add
   */
  commonAdd = 'common.add',
  /**
   * Edit
   */
  commonEdit = 'common.edit',
  /**
   * Delete
   */
  commonDelete = 'common.delete',
  /**
   * Cancel
   */
  commonCancel = 'common.cancel',
  /**
   * Clear
   */
  commonClear = 'common.clear',
  /**
   * Clear value
   */
  commonClearValue = 'common.clear.value',
  /**
   * Search
   */
  commonSearch = 'common.search',
  /**
   * Save
   */
  commonSave = 'common.save',
  /**
   * Menu
   */
  commonMenu = 'common.menu',
  /**
   * Insert
   */
  commonInsert = 'common.insert',
  /**
   * Insert snippet
   */
  commonInsertSnippet = 'common.insert.snippet',
  /**
   * Title
   */
  commonTitle = 'common.title',
  /**
   * Description
   */
  commonDescription = 'common.description',
  /**
   * Retry
   */
  commonRetry = 'common.retry',
  /**
   * Update
   */
  commonUpdate = 'common.update',
  /**
   * Info
   */
  commonInformation = 'common.information',
  /**
   * Important
   */
  commonImportant = 'common.important',
  /**
   * Sync
   */
  commonSync = 'common.sync',
  /**
   * Slug
   */
  commonSlug = 'common.slug',
  /**
   * Support
   */
  commonSupport = 'common.support',
  /**
   * Remove {0}
   */
  commonRemoveValue = 'common.remove.value',
  /**
   * Filter by {0}
   */
  commonFilterValue = 'common.filter.value',
  /**
   * Sorry, something went wrong.
   */
  commonErrorMessage = 'common.error.message',
  /**
   * Open on website
   */
  commonOpenOnWebsite = 'common.openOnWebsite',
  /**
   * Settings
   */
  commonSettings = 'common.settings',
  /**
   * Refresh settings
   */
  commonRefreshSettings = 'common.refreshSettings',
  /**
   * Pin
   */
  commonPin = 'common.pin',
  /**
   * Unpin
   */
  commonUnpin = 'common.unpin',
  /**
   * No results
   */
  commonNoResults = 'common.noResults',
  /**
   * Sorry, something went wrong.
   */
  commonError = 'common.error',
  /**
   * yes
   */
  commonYes = 'common.yes',
  /**
   * no
   */
  commonNo = 'common.no',
  /**
   * Open settings
   */
  commonOpenSettings = 'common.openSettings',
  /**
   * output window
   */
  notificationsOutputChannelLink = 'notifications.outputChannel.link',
  /**
   * Check the {0} for more details.
   */
  notificationsOutputChannelDescription = 'notifications.outputChannel.description',
  /**
   * Common
   */
  settingsViewCommon = 'settings.view.common',
  /**
   * Content folders
   */
  settingsViewContentFolders = 'settings.view.contentFolders',
  /**
   * Astro
   */
  settingsViewAstro = 'settings.view.astro',
  /**
   * Open dashboard on startup
   */
  settingsOpenOnStartup = 'settings.openOnStartup',
  /**
   * Content types
   */
  settingsContentTypes = 'settings.contentTypes',
  /**
   * Content folders
   */
  settingsContentFolders = 'settings.contentFolders',
  /**
   * Diagnostic
   */
  settingsDiagnostic = 'settings.diagnostic',
  /**
   * You can run the diagnostics to check the whole Front Matter CMS configuration.
   */
  settingsDiagnosticDescription = 'settings.diagnostic.description',
  /**
   * Run full diagnostics
   */
  settingsDiagnosticLink = 'settings.diagnostic.link',
  /**
   * Website and SSG settings
   */
  settingsCommonSettingsWebsiteTitle = 'settings.commonSettings.website.title',
  /**
   * Preview URL
   */
  settingsCommonSettingsPreviewUrl = 'settings.commonSettings.previewUrl',
  /**
   * Website URL
   */
  settingsCommonSettingsWebsiteUrl = 'settings.commonSettings.websiteUrl',
  /**
   * SSG/Framework start command
   */
  settingsCommonSettingsStartCommand = 'settings.commonSettings.startCommand',
  /**
   * Developer mode
   */
  developerTitle = 'developer.title',
  /**
   * Reload the dashboard
   */
  developerReloadTitle = 'developer.reload.title',
  /**
   * Reload
   */
  developerReloadLabel = 'developer.reload.label',
  /**
   * Open the DevTools
   */
  developerDevToolsTitle = 'developer.devTools.title',
  /**
   * DevTools
   */
  developerDevToolsLabel = 'developer.devTools.label',
  /**
   * Required field
   */
  fieldRequired = 'field.required',
  /**
   * Unknown field
   */
  fieldUnknown = 'field.unknown',
  /**
   * Answer
   */
  dashboardChatbotAnswerAnswer = 'dashboard.chatbot.answer.answer',
  /**
   * Resources
   */
  dashboardChatbotAnswerResources = 'dashboard.chatbot.answer.resources',
  /**
   * Warning: Anwers might be wrong. In case of doubt, please consult the docs.
   */
  dashboardChatbotAnswerWarning = 'dashboard.chatbot.answer.warning',
  /**
   * Assistent is getting ready
   */
  dashboardChatbotChatbotLoading = 'dashboard.chatbot.chatbot.loading',
  /**
   * I'm ready, what do you want to know?
   */
  dashboardChatbotChatbotReady = 'dashboard.chatbot.chatbot.ready',
  /**
   * How can I configure Front Matter?
   */
  dashboardChatbotChatboxPlaceholder = 'dashboard.chatbot.chatbox.placeholder',
  /**
   * Ask Front Matter AI
   */
  dashboardChatbotHeaderHeading = 'dashboard.chatbot.header.heading',
  /**
   * Our AI, powered by mendable.ai, has processed the documentation and can assist you with any queries regarding Front Matter. Go ahead and ask away!
   */
  dashboardChatbotHeaderDescription = 'dashboard.chatbot.header.description',
  /**
   * Open options
   */
  dashboardCommonChoiceButtonOpen = 'dashboard.common.choiceButton.open',
  /**
   * Menu
   */
  dashboardContentsContentActionsActionMenuButtonTitle = 'dashboard.contents.contentActions.actionMenuButton.title',
  /**
   * View
   */
  dashboardContentsContentActionsMenuItemView = 'dashboard.contents.contentActions.menuItem.view',
  /**
   * Delete: {0}
   */
  dashboardContentsContentActionsAlertTitle = 'dashboard.contents.contentActions.alert.title',
  /**
   * Are you sure you want to delete the "{0}" content?
   */
  dashboardContentsContentActionsAlertDescription = 'dashboard.contents.contentActions.alert.description',
  /**
   * <invalid title>
   */
  dashboardContentsItemInvalidTitle = 'dashboard.contents.item.invalidTitle',
  /**
   * <invalid description>
   */
  dashboardContentsItemInvalidDescription = 'dashboard.contents.item.invalidDescription',
  /**
   * Title
   */
  dashboardContentsListTitle = 'dashboard.contents.list.title',
  /**
   * Date
   */
  dashboardContentsListDate = 'dashboard.contents.list.date',
  /**
   * Status
   */
  dashboardContentsListStatus = 'dashboard.contents.list.status',
  /**
   * No Markdown to show
   */
  dashboardContentsOverviewNoMarkdown = 'dashboard.contents.overview.noMarkdown',
  /**
   * Make sure you registered a content folder in your project to let Front Matter find the contents.
   */
  dashboardContentsOverviewNoFolders = 'dashboard.contents.overview.noFolders',
  /**
   * Pinned
   */
  dashboardContentsOverviewPinned = 'dashboard.contents.overview.pinned',
  /**
   * Draft
   */
  dashboardContentsStatusDraft = 'dashboard.contents.status.draft',
  /**
   * Published
   */
  dashboardContentsStatusPublished = 'dashboard.contents.status.published',
  /**
   * Scheduled
   */
  dashboardContentsStatusScheduled = 'dashboard.contents.status.scheduled',
  /**
   * Modify the data
   */
  dashboardDataViewDataFormModify = 'dashboard.dataView.dataForm.modify',
  /**
   * Add new data
   */
  dashboardDataViewDataFormAdd = 'dashboard.dataView.dataForm.add',
  /**
   * Select your data type
   */
  dashboardDataViewDataViewSelect = 'dashboard.dataView.dataView.select',
  /**
   * Your {0} data items
   */
  dashboardDataViewDataViewTitle = 'dashboard.dataView.dataView.title',
  /**
   * Add a new entry
   */
  dashboardDataViewDataViewAdd = 'dashboard.dataView.dataView.add',
  /**
   * No {0} data entries found
   */
  dashboardDataViewDataViewEmpty = 'dashboard.dataView.dataView.empty',
  /**
   * Create or modify your {0} data
   */
  dashboardDataViewDataViewCreateOrModify = 'dashboard.dataView.dataView.createOrModify',
  /**
   * Select a data type to get started
   */
  dashboardDataViewDataViewGetStarted = 'dashboard.dataView.dataView.getStarted',
  /**
   * No data files found
   */
  dashboardDataViewDataViewNoDataFiles = 'dashboard.dataView.dataView.noDataFiles',
  /**
   * Read more to get started using data files
   */
  dashboardDataViewDataViewGetStartedLink = 'dashboard.dataView.dataView.getStarted.link',
  /**
   * Select your date type first
   */
  dashboardDataViewEmptyViewHeading = 'dashboard.dataView.emptyView.heading',
  /**
   * Edit "{0}"
   */
  dashboardDataViewSortableItemEditButtonTitle = 'dashboard.dataView.sortableItem.editButton.title',
  /**
   * Delete "{0}"
   */
  dashboardDataViewSortableItemDeleteButtonTitle = 'dashboard.dataView.sortableItem.deleteButton.title',
  /**
   * Delete data entry
   */
  dashboardDataViewSortableItemAlertTitle = 'dashboard.dataView.sortableItem.alert.title',
  /**
   * Are you sure you want to delete the data entry?
   */
  dashboardDataViewSortableItemAlertDescription = 'dashboard.dataView.sortableItem.alert.description',
  /**
   * Please close the dashboard and try again.
   */
  dashboardErrorViewDescription = 'dashboard.errorView.description',
  /**
   * Home
   */
  dashboardHeaderBreadcrumbHome = 'dashboard.header.breadcrumb.home',
  /**
   * Clear filters, grouping, and sorting
   */
  dashboardHeaderClearFiltersTitle = 'dashboard.header.clearFilters.title',
  /**
   * No filter
   */
  dashboardHeaderFilterDefault = 'dashboard.header.filter.default',
  /**
   * All types
   */
  dashboardHeaderFoldersDefault = 'dashboard.header.folders.default',
  /**
   * Showing
   */
  dashboardHeaderFoldersMenuButtonShowing = 'dashboard.header.folders.menuButton.showing',
  /**
   * None
   */
  dashboardHeaderGroupingOptionNone = 'dashboard.header.grouping.option.none',
  /**
   * Year
   */
  dashboardHeaderGroupingOptionYear = 'dashboard.header.grouping.option.year',
  /**
   * Draft/Published
   */
  dashboardHeaderGroupingOptionDraft = 'dashboard.header.grouping.option.draft',
  /**
   * Group by
   */
  dashboardHeaderGroupingMenuButtonLabel = 'dashboard.header.grouping.menuButton.label',
  /**
   * All articles
   */
  dashboardHeaderNavigationAllArticles = 'dashboard.header.navigation.allArticles',
  /**
   * Published
   */
  dashboardHeaderNavigationPublished = 'dashboard.header.navigation.published',
  /**
   * Scheduled
   */
  dashboardHeaderNavigationScheduled = 'dashboard.header.navigation.scheduled',
  /**
   * In draft
   */
  dashboardHeaderNavigationDraft = 'dashboard.header.navigation.draft',
  /**
   * Create content
   */
  dashboardHeaderHeaderCreateContent = 'dashboard.header.header.createContent',
  /**
   * Create by content type
   */
  dashboardHeaderHeaderCreateByContentType = 'dashboard.header.header.createByContentType',
  /**
   * Create by template
   */
  dashboardHeaderHeaderCreateByTemplate = 'dashboard.header.header.createByTemplate',
  /**
   * First
   */
  dashboardHeaderPaginationFirst = 'dashboard.header.pagination.first',
  /**
   * Previous
   */
  dashboardHeaderPaginationPrevious = 'dashboard.header.pagination.previous',
  /**
   * next
   */
  dashboardHeaderPaginationNext = 'dashboard.header.pagination.next',
  /**
   * Last
   */
  dashboardHeaderPaginationLast = 'dashboard.header.pagination.last',
  /**
   * Showing {0} to {1} of {2} results
   */
  dashboardHeaderPaginationStatusText = 'dashboard.header.paginationStatus.text',
  /**
   * project
   */
  dashboardHeaderProjectSwitcherLabel = 'dashboard.header.projectSwitcher.label',
  /**
   * Refresh dashboard
   */
  dashboardHeaderRefreshDashboardLabel = 'dashboard.header.refreshDashboard.label',
  /**
   * Last modified (asc)
   */
  dashboardHeaderSortingLastModifiedAsc = 'dashboard.header.sorting.lastModified.asc',
  /**
   * Last modified (desc)
   */
  dashboardHeaderSortingLastModifiedDesc = 'dashboard.header.sorting.lastModified.desc',
  /**
   * By filename (asc)
   */
  dashboardHeaderSortingFilenameAsc = 'dashboard.header.sorting.filename.asc',
  /**
   * By filename (desc)
   */
  dashboardHeaderSortingFilenameDesc = 'dashboard.header.sorting.filename.desc',
  /**
   * Published (asc)
   */
  dashboardHeaderSortingPublishedAsc = 'dashboard.header.sorting.published.asc',
  /**
   * Published (desc)
   */
  dashboardHeaderSortingPublishedDesc = 'dashboard.header.sorting.published.desc',
  /**
   * Size (asc)
   */
  dashboardHeaderSortingSizeAsc = 'dashboard.header.sorting.size.asc',
  /**
   * Size (desc)
   */
  dashboardHeaderSortingSizeDesc = 'dashboard.header.sorting.size.desc',
  /**
   * Caption (asc)
   */
  dashboardHeaderSortingCaptionAsc = 'dashboard.header.sorting.caption.asc',
  /**
   * Caption (desc)
   */
  dashboardHeaderSortingCaptionDesc = 'dashboard.header.sorting.caption.desc',
  /**
   * Alt (asc)
   */
  dashboardHeaderSortingAltAsc = 'dashboard.header.sorting.alt.asc',
  /**
   * Alt (desc)
   */
  dashboardHeaderSortingAltDesc = 'dashboard.header.sorting.alt.desc',
  /**
   * Sort by
   */
  dashboardHeaderSortingLabel = 'dashboard.header.sorting.label',
  /**
   * Open on startup?
   */
  dashboardHeaderStartupLabel = 'dashboard.header.startup.label',
  /**
   * Contents
   */
  dashboardHeaderTabsContents = 'dashboard.header.tabs.contents',
  /**
   * Media
   */
  dashboardHeaderTabsMedia = 'dashboard.header.tabs.media',
  /**
   * Snippets
   */
  dashboardHeaderTabsSnippets = 'dashboard.header.tabs.snippets',
  /**
   * data
   */
  dashboardHeaderTabsData = 'dashboard.header.tabs.data',
  /**
   * Taxonomies
   */
  dashboardHeaderTabsTaxonomies = 'dashboard.header.tabs.taxonomies',
  /**
   * Change to grid
   */
  dashboardHeaderViewSwitchToGrid = 'dashboard.header.viewSwitch.toGrid',
  /**
   * Change to list
   */
  dashboardHeaderViewSwitchToList = 'dashboard.header.viewSwitch.toList',
  /**
   * Support Front Matter
   */
  dashboardLayoutSponsorSupportMsg = 'dashboard.layout.sponsor.support.msg',
  /**
   * Review
   */
  dashboardLayoutSponsorReviewLabel = 'dashboard.layout.sponsor.review.label',
  /**
   * Review Front Matter
   */
  dashboardLayoutSponsorReviewMsg = 'dashboard.layout.sponsor.review.msg',
  /**
   * Title
   */
  dashboardMediaCommonTitle = 'dashboard.media.common.title',
  /**
   * Caption
   */
  dashboardMediaCommonCaption = 'dashboard.media.common.caption',
  /**
   * Alternate text
   */
  dashboardMediaCommonAlt = 'dashboard.media.common.alt',
  /**
   * Size
   */
  dashboardMediaCommonSize = 'dashboard.media.common.size',
  /**
   * View details
   */
  dashboardMediaDialogTitle = 'dashboard.media.dialog.title',
  /**
   * Close panel
   */
  dashboardMediaPanelClose = 'dashboard.media.panel.close',
  /**
   * Update metadata
   */
  dashboardMediaMetadataPanelTitle = 'dashboard.media.metadata.panel.title',
  /**
   * Please specify the metadata you want to set for the file.
   */
  dashboardMediaMetadataPanelDescription = 'dashboard.media.metadata.panel.description',
  /**
   * Filename
   */
  dashboardMediaMetadataPanelFieldFileName = 'dashboard.media.metadata.panel.field.fileName',
  /**
   * Metadata
   */
  dashboardMediaMetadataPanelFormMetadataTitle = 'dashboard.media.metadata.panel.form.metadata.title',
  /**
   * Information
   */
  dashboardMediaMetadataPanelFormInformationTitle = 'dashboard.media.metadata.panel.form.information.title',
  /**
   * Created
   */
  dashboardMediaMetadataPanelFormInformationCreatedDate = 'dashboard.media.metadata.panel.form.information.createdDate',
  /**
   * Last modified
   */
  dashboardMediaMetadataPanelFormInformationModifiedDate = 'dashboard.media.metadata.panel.form.information.modifiedDate',
  /**
   * Dimensions
   */
  dashboardMediaMetadataPanelFormInformationDimensions = 'dashboard.media.metadata.panel.form.information.dimensions',
  /**
   * Folder
   */
  dashboardMediaMetadataPanelFormInformationFolder = 'dashboard.media.metadata.panel.form.information.folder',
  /**
   * Create post asset folder
   */
  dashboardMediaFolderCreationHexoCreate = 'dashboard.media.folderCreation.hexo.create',
  /**
   * Create new folder
   */
  dashboardMediaFolderCreationFolderCreate = 'dashboard.media.folderCreation.folder.create',
  /**
   * Insert image for your "{0}" field
   */
  dashboardMediaItemQuickActionInsertField = 'dashboard.media.item.quickAction.insert.field',
  /**
   * Insert image with markdown markup
   */
  dashboardMediaItemQuickActionInsertMarkdown = 'dashboard.media.item.quickAction.insert.markdown',
  /**
   * Copy media path
   */
  dashboardMediaItemQuickActionCopyPath = 'dashboard.media.item.quickAction.copy.path',
  /**
   * Delete media file
   */
  dashboardMediaItemQuickActionDelete = 'dashboard.media.item.quickAction.delete',
  /**
   * Edit metadata
   */
  dashboardMediaItemMenuItemEditMetadata = 'dashboard.media.item.menuItem.edit.metadata',
  /**
   * Insert image
   */
  dashboardMediaItemMenuItemInsertImage = 'dashboard.media.item.menuItem.insert.image',
  /**
   * Reveal media
   */
  dashboardMediaItemMenuItemRevealMedia = 'dashboard.media.item.menuItem.reveal.media',
  /**
   * Select the media snippet to use for the current media file.
   */
  dashboardMediaItemInfoDialogSnippetDescription = 'dashboard.media.item.infoDialog.snippet.description',
  /**
   * Are you sure you want to delete the file from the {0} folder?
   */
  dashboardMediaItemAlertDeleteDescription = 'dashboard.media.item.alert.delete.description',
  /**
   * Select the media file to add to your content.
   */
  dashboardMediaMediaDescription = 'dashboard.media.media.description',
  /**
   * You can also drag and drop images from your desktop and select them once uploaded.
   */
  dashboardMediaMediaDragAndDrop = 'dashboard.media.media.dragAndDrop',
  /**
   * Upload to {0}
   */
  dashboardMediaMediaFolderUpload = 'dashboard.media.media.folder.upload',
  /**
   * No folder selected, files you drop will be added to the {0} folder
   */
  dashboardMediaMediaFolderDefault = 'dashboard.media.media.folder.default',
  /**
   * No media files to show. You can drag &amp; drop new files by holding your [shift] key.
   */
  dashboardMediaMediaPlaceholder = 'dashboard.media.media.placeholder',
  /**
   * Content folder
   */
  dashboardMediaMediaContentFolder = 'dashboard.media.media.contentFolder',
  /**
   * Public folder
   */
  dashboardMediaMediaPublicFolder = 'dashboard.media.media.publicFolder',
  /**
   * Search in folder
   */
  dashboardMediaMediaHeaderTopSearchboxPlaceholder = 'dashboard.media.mediaHeaderTop.searchbox.placeholder',
  /**
   * Insert media: {0}
   */
  dashboardMediaMediaSnippetFormFormDialogTitle = 'dashboard.media.mediaSnippetForm.formDialog.title',
  /**
   * Insert the {0} media file into the current article
   */
  dashboardMediaMediaSnippetFormFormDialogDescription = 'dashboard.media.mediaSnippetForm.formDialog.description',
  /**
   * Enter a URL
   */
  dashboardPreviewInputPlaceholder = 'dashboard.preview.input.placeholder',
  /**
   * Navigate
   */
  dashboardPreviewButtonNavigateTitle = 'dashboard.preview.button.navigate.title',
  /**
   * Refresh
   */
  dashboardPreviewButtonRefreshTitle = 'dashboard.preview.button.refresh.title',
  /**
   * Open
   */
  dashboardPreviewButtonOpenTitle = 'dashboard.preview.button.open.title',
  /**
   * Edit snippet
   */
  dashboardSnippetsViewItemQuickActionEditSnippet = 'dashboard.snippetsView.item.quickAction.editSnippet',
  /**
   * Delete snippet
   */
  dashboardSnippetsViewItemQuickActionDeleteSnippet = 'dashboard.snippetsView.item.quickAction.deleteSnippet',
  /**
   * View snippet file
   */
  dashboardSnippetsViewItemQuickActionViewSnippet = 'dashboard.snippetsView.item.quickAction.viewSnippet',
  /**
   * Insert snippet: {0}
   */
  dashboardSnippetsViewItemInsertFormDialogTitle = 'dashboard.snippetsView.item.insert.formDialog.title',
  /**
   * Insert the {0} snippet into the current article
   */
  dashboardSnippetsViewItemInsertFormDialogDescription = 'dashboard.snippetsView.item.insert.formDialog.description',
  /**
   * Edit snippet: {0}
   */
  dashboardSnippetsViewItemEditFormDialogTitle = 'dashboard.snippetsView.item.edit.formDialog.title',
  /**
   * Edit the {0} snippet
   */
  dashboardSnippetsViewItemEditFormDialogDescription = 'dashboard.snippetsView.item.edit.formDialog.description',
  /**
   * Delete snippet: {0}
   */
  dashboardSnippetsViewItemAlertTitle = 'dashboard.snippetsView.item.alert.title',
  /**
   * Are you sure you want to delete the {0} snippet?
   */
  dashboardSnippetsViewItemAlertDescription = 'dashboard.snippetsView.item.alert.description',
  /**
   * Snippet title
   */
  dashboardSnippetsViewNewFormSnippetInputTitlePlaceholder = 'dashboard.snippetsView.newForm.snippetInput.title.placeholder',
  /**
   * Description
   */
  dashboardSnippetsViewNewFormSnippetInputDescriptionLabel = 'dashboard.snippetsView.newForm.snippetInput.description.label',
  /**
   * Snippet description
   */
  dashboardSnippetsViewNewFormSnippetInputDescriptionPlaceholder = 'dashboard.snippetsView.newForm.snippetInput.description.placeholder',
  /**
   * Snippet
   */
  dashboardSnippetsViewNewFormSnippetInputSnippetLabel = 'dashboard.snippetsView.newForm.snippetInput.snippet.label',
  /**
   * Snippet content
   */
  dashboardSnippetsViewNewFormSnippetInputSnippetPlaceholder = 'dashboard.snippetsView.newForm.snippetInput.snippet.placeholder',
  /**
   * Is a media snippet?
   */
  dashboardSnippetsViewNewFormSnippetInputIsMediaSnippetLabel = 'dashboard.snippetsView.newForm.snippetInput.isMediaSnippet.label',
  /**
   * Media snippet
   */
  dashboardSnippetsViewNewFormSnippetInputIsMediaSnippetCheckboxLabel = 'dashboard.snippetsView.newForm.snippetInput.isMediaSnippet.checkbox.label',
  /**
   * Use the current snippet for inserting media files into your content.
   */
  dashboardSnippetsViewNewFormSnippetInputIsMediaSnippetCheckboxDescription = 'dashboard.snippetsView.newForm.snippetInput.isMediaSnippet.checkbox.description',
  /**
   * Read more on using media snippet placeholders
   */
  dashboardSnippetsViewNewFormSnippetInputDocsButtonTitle = 'dashboard.snippetsView.newForm.snippetInput.docsButton.title',
  /**
   * Check our media snippet placeholders documentation to know which placeholders you can use.
   */
  dashboardSnippetsViewNewFormSnippetInputDocsButtonDescription = 'dashboard.snippetsView.newForm.snippetInput.docsButton.description',
  /**
   * Snippets header
   */
  dashboardSnippetsViewSnippetsAriaLabel = 'dashboard.snippetsView.snippets.ariaLabel',
  /**
   * Create new snippet
   */
  dashboardSnippetsViewSnippetsButtonCreate = 'dashboard.snippetsView.snippets.button.create',
  /**
   * Select the snippet to add to your content.
   */
  dashboardSnippetsViewSnippetsSelectDescription = 'dashboard.snippetsView.snippets.select.description',
  /**
   * No snippets found
   */
  dashboardSnippetsViewSnippetsEmptyMessage = 'dashboard.snippetsView.snippets.empty.message',
  /**
   * Read more to get started with snippets
   */
  dashboardSnippetsViewSnippetsReadMore = 'dashboard.snippetsView.snippets.readMore',
  /**
   * Create a snippet
   */
  dashboardSnippetsViewSnippetsFormDialogTitle = 'dashboard.snippetsView.snippets.formDialog.title',
  /**
   * Add as a content folder to Front Matter
   */
  dashboardStepsStepsToGetStartedButtonAddFolderTitle = 'dashboard.steps.stepsToGetStarted.button.addFolder.title',
  /**
   * Initialize project
   */
  dashboardStepsStepsToGetStartedInitializeProjectName = 'dashboard.steps.stepsToGetStarted.initializeProject.name',
  /**
   * Initialize the project will create the required files and folders for using the Front Matter CMS. Start by clicking on this action.
   */
  dashboardStepsStepsToGetStartedInitializeProjectDescription = 'dashboard.steps.stepsToGetStarted.initializeProject.description',
  /**
   * Framework presets
   */
  dashboardStepsStepsToGetStartedFrameworkName = 'dashboard.steps.stepsToGetStarted.framework.name',
  /**
   * Select your site-generator or framework to prefill some of the recommended settings.
   */
  dashboardStepsStepsToGetStartedFrameworkDescription = 'dashboard.steps.stepsToGetStarted.framework.description',
  /**
   * Select your framework
   */
  dashboardStepsStepsToGetStartedFrameworkSelect = 'dashboard.steps.stepsToGetStarted.framework.select',
  /**
   * other
   */
  dashboardStepsStepsToGetStartedFrameworkSelectOther = 'dashboard.steps.stepsToGetStarted.framework.select.other',
  /**
   * What is your assets folder?
   */
  dashboardStepsStepsToGetStartedAssetsFolderName = 'dashboard.steps.stepsToGetStarted.assetsFolder.name',
  /**
   * Select the folder containing your assets. This folder will be used to store all your media files for your articles.
   */
  dashboardStepsStepsToGetStartedAssetsFolderDescription = 'dashboard.steps.stepsToGetStarted.assetsFolder.description',
  /**
   * Use the 'public' folder
   */
  dashboardStepsStepsToGetStartedAssetsFolderPublicTitle = 'dashboard.steps.stepsToGetStarted.assetsFolder.public.title',
  /**
   * Use the Astro assets folder (src/assets)
   */
  dashboardStepsStepsToGetStartedAssetsFolderAssetsTitle = 'dashboard.steps.stepsToGetStarted.assetsFolder.assets.title',
  /**
   * In case you want to configure another folder, you can do this manually in the frontmatter.json file.
   */
  dashboardStepsStepsToGetStartedAssetsFolderOtherDescription = 'dashboard.steps.stepsToGetStarted.assetsFolder.other.description',
  /**
   * Register content folder(s)
   */
  dashboardStepsStepsToGetStartedContentFoldersName = 'dashboard.steps.stepsToGetStarted.contentFolders.name',
  /**
   * Add one of the folders we found in your project as a content folder. Once a folder is set, Front Matter can be used to list all contents and allow you to create content.
   */
  dashboardStepsStepsToGetStartedContentFoldersDescription = 'dashboard.steps.stepsToGetStarted.contentFolders.description',
  /**
   * Folders containing content:
   */
  dashboardStepsStepsToGetStartedContentFoldersLabel = 'dashboard.steps.stepsToGetStarted.contentFolders.label',
  /**
   * You can also perform this action by right-clicking on the folder in the explorer view, and selecting register folder
   */
  dashboardStepsStepsToGetStartedContentFoldersInformationDescription = 'dashboard.steps.stepsToGetStarted.contentFolders.information.description',
  /**
   * Import all tags and categories (optional)
   */
  dashboardStepsStepsToGetStartedTagsName = 'dashboard.steps.stepsToGetStarted.tags.name',
  /**
   * Now that Front Matter knows all the content folders. Would you like to import all tags and categories from the available content?
   */
  dashboardStepsStepsToGetStartedTagsDescription = 'dashboard.steps.stepsToGetStarted.tags.description',
  /**
   * Show the dashboard
   */
  dashboardStepsStepsToGetStartedShowDashboardName = 'dashboard.steps.stepsToGetStarted.showDashboard.name',
  /**
   * Once all actions are completed, the dashboard can be loaded.
   */
  dashboardStepsStepsToGetStartedShowDashboardDescription = 'dashboard.steps.stepsToGetStarted.showDashboard.description',
  /**
   * Use a configuration template
   */
  dashboardStepsStepsToGetStartedTemplateName = 'dashboard.steps.stepsToGetStarted.template.name',
  /**
   * Select a template to prefill the frontmatter.json file with the recommended settings.
   */
  dashboardStepsStepsToGetStartedTemplateDescription = 'dashboard.steps.stepsToGetStarted.template.description',
  /**
   * Selecting a template applies a whole configuration to your project and closes this configuration view.
   */
  dashboardStepsStepsToGetStartedTemplateWarning = 'dashboard.steps.stepsToGetStarted.template.warning',
  /**
   * Create Content-Types for your Astro Content Collections
   */
  dashboardStepsStepsToGetStartedAstroContentTypesName = 'dashboard.steps.stepsToGetStarted.astroContentTypes.name',
  /**
   * Add {0} to taxonomy settings
   */
  dashboardTaxonomyViewButtonAddTitle = 'dashboard.taxonomyView.button.add.title',
  /**
   * Edit {0}
   */
  dashboardTaxonomyViewButtonEditTitle = 'dashboard.taxonomyView.button.edit.title',
  /**
   * Merge {0}
   */
  dashboardTaxonomyViewButtonMergeTitle = 'dashboard.taxonomyView.button.merge.title',
  /**
   * Move to another taxonomy type
   */
  dashboardTaxonomyViewButtonMoveTitle = 'dashboard.taxonomyView.button.move.title',
  /**
   * Delete {0}
   */
  dashboardTaxonomyViewButtonDeleteTitle = 'dashboard.taxonomyView.button.delete.title',
  /**
   * Show contents with {0} in {1}
   */
  dashboardTaxonomyViewTaxonomyLookupButtonTitle = 'dashboard.taxonomyView.taxonomyLookup.button.title',
  /**
   * Create, edit, and manage the {0} of your site
   */
  dashboardTaxonomyViewTaxonomyManagerDescription = 'dashboard.taxonomyView.taxonomyManager.description',
  /**
   * Create a new {0} value
   */
  dashboardTaxonomyViewTaxonomyManagerButtonCreate = 'dashboard.taxonomyView.taxonomyManager.button.create',
  /**
   * Name
   */
  dashboardTaxonomyViewTaxonomyManagerTableHeadingName = 'dashboard.taxonomyView.taxonomyManager.table.heading.name',
  /**
   * Count
   */
  dashboardTaxonomyViewTaxonomyManagerTableHeadingCount = 'dashboard.taxonomyView.taxonomyManager.table.heading.count',
  /**
   * Action
   */
  dashboardTaxonomyViewTaxonomyManagerTableHeadingAction = 'dashboard.taxonomyView.taxonomyManager.table.heading.action',
  /**
   * No {0} found
   */
  dashboardTaxonomyViewTaxonomyManagerTableRowEmpty = 'dashboard.taxonomyView.taxonomyManager.table.row.empty',
  /**
   * Missing in your settings
   */
  dashboardTaxonomyViewTaxonomyManagerTableUnmappedTitle = 'dashboard.taxonomyView.taxonomyManager.table.unmapped.title',
  /**
   * Select the taxonomy
   */
  dashboardTaxonomyViewTaxonomyViewNavigationBarTitle = 'dashboard.taxonomyView.taxonomyView.navigationBar.title',
  /**
   * Import taxonomy
   */
  dashboardTaxonomyViewTaxonomyViewButtonImport = 'dashboard.taxonomyView.taxonomyView.button.import',
  /**
   * Tags
   */
  dashboardTaxonomyViewTaxonomyViewNavigationItemTags = 'dashboard.taxonomyView.taxonomyView.navigationItem.tags',
  /**
   * Categories
   */
  dashboardTaxonomyViewTaxonomyViewNavigationItemCategories = 'dashboard.taxonomyView.taxonomyView.navigationItem.categories',
  /**
   * View does not exist
   */
  dashboardUnkownViewTitle = 'dashboard.unkownView.title',
  /**
   * You seem to have ended up on a view that doesn't exist. Please re-open the dashboard.
   */
  dashboardUnkownViewDescription = 'dashboard.unkownView.description',
  /**
   * Manage your static site with Front Matter
   */
  dashboardWelcomeScreenTitle = 'dashboard.welcomeScreen.title',
  /**
   * Thank you for using Front Matter!
   */
  dashboardWelcomeScreenThanks = 'dashboard.welcomeScreen.thanks',
  /**
   * We try to aim to make Front Matter as easy to use as possible, but if you have any questions or suggestions. Please don't hesitate to reach out to us on GitHub.
   */
  dashboardWelcomeScreenDescription = 'dashboard.welcomeScreen.description',
  /**
   * GitHub
   */
  dashboardWelcomeScreenLinkGithubTitle = 'dashboard.welcomeScreen.link.github.title',
  /**
   * GitHub
   */
  dashboardWelcomeScreenLinkGithubLabel = 'dashboard.welcomeScreen.link.github.label',
  /**
   * Documentation
   */
  dashboardWelcomeScreenLinkDocumentationLabel = 'dashboard.welcomeScreen.link.documentation.label',
  /**
   * Become a sponsor
   */
  dashboardWelcomeScreenLinkSponsorTitle = 'dashboard.welcomeScreen.link.sponsor.title',
  /**
   * Sponsor
   */
  dashboardWelcomeScreenLinkSponsorLabel = 'dashboard.welcomeScreen.link.sponsor.label',
  /**
   * Write a review
   */
  dashboardWelcomeScreenLinkReviewTitle = 'dashboard.welcomeScreen.link.review.title',
  /**
   * Review
   */
  dashboardWelcomeScreenLinkReviewLabel = 'dashboard.welcomeScreen.link.review.label',
  /**
   * Perform the next steps to get you started with the extension
   */
  dashboardWelcomeScreenActionsHeading = 'dashboard.welcomeScreen.actions.heading',
  /**
   * You can also use the extension from the Front Matter side panel. There you will find the actions you can perform specifically for your pages.
   */
  dashboardWelcomeScreenActionsDescription = 'dashboard.welcomeScreen.actions.description',
  /**
   * We hope you enjoy Front Matter!
   */
  dashboardWelcomeScreenActionsThanks = 'dashboard.welcomeScreen.actions.thanks',
  /**
   * Do you want to remap the metadata of unmapped files?
   */
  dashboardMediaDetailsSlideOverUnmappedDescription = 'dashboard.media.detailsSlideOver.unmapped.description',
  /**
   * No Astro Content Collections found.
   */
  dashboardConfigurationAstroAstroContentTypesEmpty = 'dashboard.configuration.astro.astroContentTypes.empty',
  /**
   * The following Astro Content Collections can be used to generate a content-type.
   */
  dashboardConfigurationAstroAstroContentTypesDescription = 'dashboard.configuration.astro.astroContentTypes.description',
  /**
   * Content-type
   */
  panelContentTypeContentTypeValidatorTitle = 'panel.contentType.contentTypeValidator.title',
  /**
   * We noticed field differences between the content-type and the front matter data. 
 Would you like to create, update, or set the content-type for this content?
   */
  panelContentTypeContentTypeValidatorHint = 'panel.contentType.contentTypeValidator.hint',
  /**
   * Create content-type
   */
  panelContentTypeContentTypeValidatorButtonCreate = 'panel.contentType.contentTypeValidator.button.create',
  /**
   * Add missing fields to content-type
   */
  panelContentTypeContentTypeValidatorButtonAdd = 'panel.contentType.contentTypeValidator.button.add',
  /**
   * Change content-type of the file
   */
  panelContentTypeContentTypeValidatorButtonChange = 'panel.contentType.contentTypeValidator.button.change',
  /**
   * Editing: {0}
   */
  panelDataBlockDataBlockFieldGroupSelectedEdit = 'panel.dataBlock.dataBlockField.group.selected.edit',
  /**
   * Create a new {0}
   */
  panelDataBlockDataBlockFieldGroupSelectedCreate = 'panel.dataBlock.dataBlockField.group.selected.create',
  /**
   * Select a group
   */
  panelDataBlockDataBlockFieldGroupSelect = 'panel.dataBlock.dataBlockField.group.select',
  /**
   * Add {0}
   */
  panelDataBlockDataBlockFieldAdd = 'panel.dataBlock.dataBlockField.add',
  /**
   * Edit record
   */
  panelDataBlockDataBlockRecordEdit = 'panel.dataBlock.dataBlockRecord.edit',
  /**
   * Delete record
   */
  panelDataBlockDataBlockRecordDelete = 'panel.dataBlock.dataBlockRecord.delete',
  /**
   * Records
   */
  panelDataBlockDataBlockRecordsLabel = 'panel.dataBlock.dataBlockRecords.label',
  /**
   * Block type
   */
  panelDataBlockDataBlockSelectorLabel = 'panel.dataBlock.dataBlockSelector.label',
  /**
   * Failed viewing the field
   */
  panelErrorBoundaryFieldBoundaryLabel = 'panel.errorBoundary.fieldBoundary.label',
  /**
   * Select {0}
   */
  panelFieldsChoiceFieldSelect = 'panel.fields.choiceField.select',
  /**
   * Clear value
   */
  panelFieldsChoiceFieldClear = 'panel.fields.choiceField.clear',
  /**
   * Fetching possible values...
   */
  panelFieldsContentTypeRelationshipFieldLoading = 'panel.fields.contentTypeRelationshipField.loading',
  /**
   * Pick your date
   */
  panelFieldsDateTimeFieldButtonPick = 'panel.fields.dateTimeField.button.pick',
  /**
   * Time:
   */
  panelFieldsDateTimeFieldTime = 'panel.fields.dateTimeField.time',
  /**
   * The {0} field is required
   */
  panelFieldsFieldMessageRequired = 'panel.fields.fieldMessage.required',
  /**
   * Delete file
   */
  panelFieldsFileFieldDelete = 'panel.fields.fileField.delete',
  /**
   * Add your {0}
   */
  panelFieldsFileFieldAdd = 'panel.fields.fileField.add',
  /**
   * The image coundn't be loaded
   */
  panelFieldsImageFallbackLabel = 'panel.fields.imageFallback.label',
  /**
   * Edit record
   */
  panelFieldsListFieldEdit = 'panel.fields.listField.edit',
  /**
   * Delete record
   */
  panelFieldsListFieldDelete = 'panel.fields.listField.delete',
  /**
   * Remove image
   */
  panelFieldsPreviewImageRemove = 'panel.fields.previewImage.remove',
  /**
   * Add your {0}
   */
  panelFieldsPreviewImageFieldAdd = 'panel.fields.previewImageField.add',
  /**
   * Update available
   */
  panelFieldsSlugFieldUpdate = 'panel.fields.slugField.update',
  /**
   * Generate slug
   */
  panelFieldsSlugFieldGenerate = 'panel.fields.slugField.generate',
  /**
   * Use Front Matter AI to suggest {0}
   */
  panelFieldsTextFieldAiMessage = 'panel.fields.textField.ai.message',
  /**
   * Generating suggestion...
   */
  panelFieldsTextFieldAiGenerate = 'panel.fields.textField.ai.generate',
  /**
   * Loading field
   */
  panelFieldsTextFieldLoading = 'panel.fields.textField.loading',
  /**
   * Field limit reached {0}
   */
  panelFieldsTextFieldLimit = 'panel.fields.textField.limit',
  /**
   * Unkown field type: {0}
   */
  panelFieldsWrapperFieldUnknown = 'panel.fields.wrapperField.unknown',
  /**
   * Actions
   */
  panelActionsTitle = 'panel.actions.title',
  /**
   * More details
   */
  panelArticleDetailsTitle = 'panel.articleDetails.title',
  /**
   * Type
   */
  panelArticleDetailsType = 'panel.articleDetails.type',
  /**
   * Total
   */
  panelArticleDetailsTotal = 'panel.articleDetails.total',
  /**
   * Headings
   */
  panelArticleDetailsHeadings = 'panel.articleDetails.headings',
  /**
   * Paragraphs
   */
  panelArticleDetailsParagraphs = 'panel.articleDetails.paragraphs',
  /**
   * Internal links
   */
  panelArticleDetailsInternalLinks = 'panel.articleDetails.internalLinks',
  /**
   * External links
   */
  panelArticleDetailsExternalLinks = 'panel.articleDetails.externalLinks',
  /**
   * Images
   */
  panelArticleDetailsImages = 'panel.articleDetails.images',
  /**
   * Initialize project
   */
  panelBaseViewInitialize = 'panel.baseView.initialize',
  /**
   * Actions
   */
  panelBaseViewActionsTitle = 'panel.baseView.actions.title',
  /**
   * Open dashboard
   */
  panelBaseViewActionOpenDashboard = 'panel.baseView.action.openDashboard',
  /**
   * Create content
   */
  panelBaseViewActionCreateContent = 'panel.baseView.action.createContent',
  /**
   * Open a file to see more actions
   */
  panelBaseViewEmpty = 'panel.baseView.empty',
  /**
   * file
   */
  panelFileListLabelSingular = 'panel.fileList.label.singular',
  /**
   * files
   */
  panelFileListLabelPlural = 'panel.fileList.label.plural',
  /**
   * Recently modified
   */
  panelFolderAndFilesTitle = 'panel.folderAndFiles.title',
  /**
   * Global settings
   */
  panelGlobalSettingsTitle = 'panel.globalSettings.title',
  /**
   * Modified date
   */
  panelGlobalSettingsActionModifiedDateLabel = 'panel.globalSettings.action.modifiedDate.label',
  /**
   * Auto-update modified date
   */
  panelGlobalSettingsActionModifiedDateDescription = 'panel.globalSettings.action.modifiedDate.description',
  /**
   * Front Matter highlight
   */
  panelGlobalSettingsActionFrontMatterLabel = 'panel.globalSettings.action.frontMatter.label',
  /**
   * Highlight Front Matter
   */
  panelGlobalSettingsActionFrontMatterDescription = 'panel.globalSettings.action.frontMatter.description',
  /**
   * Local preview
   */
  panelGlobalSettingsActionPreviewLabel = 'panel.globalSettings.action.preview.label',
  /**
   * Example: {0}
   */
  panelGlobalSettingsActionPreviewPlaceholder = 'panel.globalSettings.action.preview.placeholder',
  /**
   * Local server command
   */
  panelGlobalSettingsActionServerLabel = 'panel.globalSettings.action.server.label',
  /**
   * Example: {0}
   */
  panelGlobalSettingsActionServerPlaceholder = 'panel.globalSettings.action.server.placeholder',
  /**
   * Metadata
   */
  panelMetadataTitle = 'panel.metadata.title',
  /**
   * Other actions
   */
  panelOtherActionsTitle = 'panel.otherActions.title',
  /**
   * Writing settings enabled
   */
  panelOtherActionsWritingSettingsEnabled = 'panel.otherActions.writingSettings.enabled',
  /**
   * Enable writing settings
   */
  panelOtherActionsWritingSettingsDisabled = 'panel.otherActions.writingSettings.disabled',
  /**
   * Toggle center mode
   */
  panelOtherActionsCenterMode = 'panel.otherActions.centerMode',
  /**
   * Create template
   */
  panelOtherActionsCreateTemplate = 'panel.otherActions.createTemplate',
  /**
   * Reveal file in folder
   */
  panelOtherActionsRevealFile = 'panel.otherActions.revealFile',
  /**
   * Reveal project folder
   */
  panelOtherActionsOpenProject = 'panel.otherActions.openProject',
  /**
   * Open documentation
   */
  panelOtherActionsDocumentation = 'panel.otherActions.documentation',
  /**
   * Settings overview
   */
  panelOtherActionsSettings = 'panel.otherActions.settings',
  /**
   * Report an issue
   */
  panelOtherActionsIssue = 'panel.otherActions.issue',
  /**
   * Open preview
   */
  panelPreviewTitle = 'panel.preview.title',
  /**
   * Publish
   */
  panelPublishActionPublish = 'panel.publishAction.publish',
  /**
   * Revert to draft
   */
  panelPublishActionUnpublish = 'panel.publishAction.unpublish',
  /**
   * Recommended
   */
  panelSeoDetailsRecommended = 'panel.seoDetails.recommended',
  /**
   * Keyword usage {0} *
   */
  panelSeoKeywordInfoDensity = 'panel.seoKeywordInfo.density',
  /**
   * Used in heading(s)
   */
  panelSeoKeywordInfoValidInfoLabel = 'panel.seoKeywordInfo.validInfo.label',
  /**
   * Content
   */
  panelSeoKeywordInfoValidInfoContent = 'panel.seoKeywordInfo.validInfo.content',
  /**
   * Keywords
   */
  panelSeoKeywordsTitle = 'panel.seoKeywords.title',
  /**
   * Keyword
   */
  panelSeoKeywordsHeaderKeyword = 'panel.seoKeywords.header.keyword',
  /**
   * Details
   */
  panelSeoKeywordsHeaderDetails = 'panel.seoKeywords.header.details',
  /**
   * * A keyword density of 1-1.5% is sufficient in most cases.
   */
  panelSeoKeywordsDensity = 'panel.seoKeywords.density',
  /**
   * Recommendations
   */
  panelSeoStatusTitle = 'panel.seoStatus.title',
  /**
   * Property
   */
  panelSeoStatusHeaderProperty = 'panel.seoStatus.header.property',
  /**
   * Length
   */
  panelSeoStatusHeaderLength = 'panel.seoStatus.header.length',
  /**
   * Valid
   */
  panelSeoStatusHeaderValid = 'panel.seoStatus.header.valid',
  /**
   * {0} chars
   */
  panelSeoStatusSeoFieldInfoCharacters = 'panel.seoStatus.seoFieldInfo.characters',
  /**
   * {0} words
   */
  panelSeoStatusSeoFieldInfoWords = 'panel.seoStatus.seoFieldInfo.words',
  /**
   * Article length
   */
  panelSeoStatusSeoFieldInfoArticle = 'panel.seoStatus.seoFieldInfo.article',
  /**
   * SEO Status
   */
  panelSeoStatusCollapsibleTitle = 'panel.seoStatus.collapsible.title',
  /**
   * {0} or {1} is required.
   */
  panelSeoStatusRequired = 'panel.seoStatus.required',
  /**
   * Optimize slug
   */
  panelSlugActionTitle = 'panel.slugAction.title',
  /**
   * Loading...
   */
  panelSpinnerLoading = 'panel.spinner.loading',
  /**
   * Start server
   */
  panelStartServerbuttonStart = 'panel.startServerbutton.start',
  /**
   * Stop server
   */
  panelStartServerbuttonStop = 'panel.startServerbutton.stop',
  /**
   * Add {0} to your settings
   */
  panelTagAdd = 'panel.tag.add',
  /**
   * Pick your {0}
   */
  panelTagPickerInputPlaceholderEmpty = 'panel.tagPicker.inputPlaceholder.empty',
  /**
   * You have reached the limit of {0}
   */
  panelTagPickerInputPlaceholderDisabled = 'panel.tagPicker.inputPlaceholder.disabled',
  /**
   * Use Front Matter AI to suggest {0}
   */
  panelTagPickerAiSuggest = 'panel.tagPicker.ai.suggest',
  /**
   * Generating suggestions...
   */
  panelTagPickerAiGenerating = 'panel.tagPicker.ai.generating',
  /**
   * Max.: {0}
   */
  panelTagPickerLimit = 'panel.tagPicker.limit',
  /**
   * Add the unknown tag
   */
  panelTagPickerUnkown = 'panel.tagPicker.unkown',
  /**
   * Be aware, this tag "{0}" is not saved in your settings. Once removed, it will be gone forever.
   */
  panelTagsTagWarning = 'panel.tags.tag.warning',
  /**
   * Continue in the media dashboard to select the image you want to insert.
   */
  panelViewPanelMediaInsert = 'panel.viewPanel.mediaInsert',
  /**
   * No {0} configured.
   */
  commandsArticleNotificationNoTaxonomy = 'commands.article.notification.noTaxonomy',
  /**
   * Select your {0} to insert.
   */
  commandsArticleQuickPickPlaceholder = 'commands.article.quickPick.placeholder',
  /**
   * Something failed while parsing the date format. Check your "{0}" setting.
   */
  commandsArticleSetDateError = 'commands.article.setDate.error',
  /**
   * Failed to rename file: {0}
   */
  commandsArticleUpdateSlugError = 'commands.article.updateSlug.error',
  /**
   * Cache cleared
   */
  commandsCacheCleared = 'commands.cache.cleared',
  /**
   * Ask me anything
   */
  commandsChatbotTitle = 'commands.chatbot.title',
  /**
   * Create content by content type
   */
  commandsContentOptionContentTypeLabel = 'commands.content.option.contentType.label',
  /**
   * Select if you want to create new content by the available content type(s)
   */
  commandsContentOptionContentTypeDescription = 'commands.content.option.contentType.description',
  /**
   * Create content by template
   */
  commandsContentOptionTemplateLabel = 'commands.content.option.template.label',
  /**
   * Select if you want to create new content by the available template(s)
   */
  commandsContentOptionTemplateDescription = 'commands.content.option.template.description',
  /**
   * Create content
   */
  commandsContentQuickPickTitle = 'commands.content.quickPick.title',
  /**
   * Select how you want to create your new content
   */
  commandsContentQuickPickPlaceholder = 'commands.content.quickPick.placeholder',
  /**
   * Dashboard
   */
  commandsDashboardTitle = 'commands.dashboard.title',
  /**
   * Add media folder
   */
  commandsFoldersAddMediaFolderInputBoxTitle = 'commands.folders.addMediaFolder.inputBox.title',
  /**
   * Which name would you like to give to your folder (use "/" to create multi-level folders)?
   */
  commandsFoldersAddMediaFolderInputBoxPrompt = 'commands.folders.addMediaFolder.inputBox.prompt',
  /**
   * No folder name was specified.
   */
  commandsFoldersAddMediaFolderNoFolderWarning = 'commands.folders.addMediaFolder.noFolder.warning',
  /**
   * Folder is already registered
   */
  commandsFoldersCreateFolderExistsWarning = 'commands.folders.create.folderExists.warning',
  /**
   * Register folder
   */
  commandsFoldersCreateInputTitle = 'commands.folders.create.input.title',
  /**
   * Which name would you like to specify for this folder?
   */
  commandsFoldersCreateInputPrompt = 'commands.folders.create.input.prompt',
  /**
   * Folder name
   */
  commandsFoldersCreateInputPlaceholder = 'commands.folders.create.input.placeholder',
  /**
   * Folder registered
   */
  commandsFoldersCreateSuccess = 'commands.folders.create.success',
  /**
   * Please select the main workspace folder for Front Matter to use.
   */
  commandsFoldersGetWorkspaceFolderWorkspaceFolderPickPlaceholder = 'commands.folders.getWorkspaceFolder.workspaceFolderPick.placeholder',
  /**
   * Folder "{0}" does not exist. Please remove it from the settings.
   */
  commandsFoldersGetNotificationErrorTitle = 'commands.folders.get.notificationError.title',
  /**
   * Remove folder
   */
  commandsFoldersGetNotificationErrorRemoveAction = 'commands.folders.get.notificationError.remove.action',
  /**
   * Create folder
   */
  commandsFoldersGetNotificationErrorCreateAction = 'commands.folders.get.notificationError.create.action',
  /**
   * Preview: {0}
   */
  commandsPreviewPanelTitle = 'commands.preview.panel.title',
  /**
   * Select the folder of the article to preview
   */
  commandsPreviewAskUserToPickFolderTitle = 'commands.preview.askUserToPickFolder.title',
  /**
   * Project initialized successfully.
   */
  commandsProjectInitializeSuccess = 'commands.project.initialize.success',
  /**
   * To which project do you want to switch?
   */
  commandsProjectSwitchProjectTitle = 'commands.project.switchProject.title',
  /**
   * Sample template created.
   */
  commandsProjectCreateSampleTemplateInfo = 'commands.project.createSampleTemplate.info',
  /**
   * Insert the value of the {0} that you want to add to your configuration.
   */
  commandsSettingsCreateInputPrompt = 'commands.settings.create.input.prompt',
  /**
   * Name of the {0}
   */
  commandsSettingsCreateInputPlaceholder = 'commands.settings.create.input.placeholder',
  /**
   * The provided {0} already exists.
   */
  commandsSettingsCreateWarning = 'commands.settings.create.warning',
  /**
   * Do you want to add the new {0} to the page?
   */
  commandsSettingsCreateQuickPickPlaceholder = 'commands.settings.create.quickPick.placeholder',
  /**
   * {0}: exporting tags and categories
   */
  commandsSettingsExportProgressTitle = 'commands.settings.export.progress.title',
  /**
   * Export completed. Tags: {0} - Categories: {1}.
   */
  commandsSettingsExportProgressSuccess = 'commands.settings.export.progress.success',
  /**
   * Remap
   */
  commandsSettingsRemapQuickpickTitle = 'commands.settings.remap.quickpick.title',
  /**
   * What do you want to remap?
   */
  commandsSettingsRemapQuickpickPlaceholder = 'commands.settings.remap.quickpick.placeholder',
  /**
   * No {0} configured.
   */
  commandsSettingsRemapNoTaxonomyWarning = 'commands.settings.remap.noTaxonomy.warning',
  /**
   * Select your {0} to insert.
   */
  commandsSettingsRemapSelectTaxonomyPlaceholder = 'commands.settings.remap.selectTaxonomy.placeholder',
  /**
   * Specify the value of the {0} with which you want to remap "{1}". Leave the input <blank> if you want to remove the {0} from all articles.
   */
  commandsSettingsRemapNewOptionInputPrompt = 'commands.settings.remap.newOption.input.prompt',
  /**
   * Name of the {0}
   */
  commandsSettingsRemapNewOptionInputPlaceholder = 'commands.settings.remap.newOption.input.placeholder',
  /**
   * Delete {0} {1}?
   */
  commandsSettingsRemapDeletePlaceholder = 'commands.settings.remap.delete.placeholder',
  /**
   * The {0} field is required. Please define a value for the field.
   */
  commandsStatusListenerVerifyRequiredFieldsDiagnosticEmptyField = 'commands.statusListener.verifyRequiredFields.diagnostic.emptyField',
  /**
   * The following fields are required to contain a value: {0}
   */
  commandsStatusListenerVerifyRequiredFieldsNotificationError = 'commands.statusListener.verifyRequiredFields.notification.error',
  /**
   * Template title
   */
  commandsTemplateGenerateInputTitle = 'commands.template.generate.input.title',
  /**
   * Which name would you like to give your template?
   */
  commandsTemplateGenerateInputPrompt = 'commands.template.generate.input.prompt',
  /**
   * article
   */
  commandsTemplateGenerateInputPlaceholder = 'commands.template.generate.input.placeholder',
  /**
   * You did not specify a template title.
   */
  commandsTemplateGenerateNoTitleWarning = 'commands.template.generate.noTitle.warning',
  /**
   * Keep content
   */
  commandsTemplateGenerateKeepContentsTitle = 'commands.template.generate.keepContents.title',
  /**
   * Do you want to keep the contents for the template?
   */
  commandsTemplateGenerateKeepContentsPlaceholder = 'commands.template.generate.keepContents.placeholder',
  /**
   * You did not pick any of the options for keeping the template its content.
   */
  commandsTemplateGenerateKeepContentsNoOptionWarning = 'commands.template.generate.keepContents.noOption.warning',
  /**
   * Template created and is now available in your {0} folder.
   */
  commandsTemplateGenerateKeepContentsSuccess = 'commands.template.generate.keepContents.success',
  /**
   * No templates found.
   */
  commandsTemplateGetTemplatesWarning = 'commands.template.getTemplates.warning',
  /**
   * Incorrect project folder path retrieved.
   */
  commandsTemplateCreateFolderPathWarning = 'commands.template.create.folderPath.warning',
  /**
   * No templates found.
   */
  commandsTemplateCreateNoTemplatesWarning = 'commands.template.create.noTemplates.warning',
  /**
   * Select a template
   */
  commandsTemplateCreateSelectTemplateTitle = 'commands.template.create.selectTemplate.title',
  /**
   * Select the content template to use
   */
  commandsTemplateCreateSelectTemplatePlaceholder = 'commands.template.create.selectTemplate.placeholder',
  /**
   * No template selected.
   */
  commandsTemplateCreateSelectTemplateNoTemplateWarning = 'commands.template.create.selectTemplate.noTemplate.warning',
  /**
   * Content template could not be found.
   */
  commandsTemplateCreateSelectTemplateNotFoundWarning = 'commands.template.create.selectTemplate.notFound.warning',
  /**
   * Your new content is now available.
   */
  commandsTemplateCreateSuccess = 'commands.template.create.success',
  /**
   * Unordered list
   */
  commandsWysiwygCommandUnorderedListLabel = 'commands.wysiwyg.command.unorderedList.label',
  /**
   * Add an unordered list
   */
  commandsWysiwygCommandUnorderedListDetail = 'commands.wysiwyg.command.unorderedList.detail',
  /**
   * Ordered list
   */
  commandsWysiwygCommandOrderedListLabel = 'commands.wysiwyg.command.orderedList.label',
  /**
   * Add an ordered list
   */
  commandsWysiwygCommandOrderedListDetail = 'commands.wysiwyg.command.orderedList.detail',
  /**
   * Task list
   */
  commandsWysiwygCommandTaskListLabel = 'commands.wysiwyg.command.taskList.label',
  /**
   * Add a task list
   */
  commandsWysiwygCommandTaskListDetail = 'commands.wysiwyg.command.taskList.detail',
  /**
   * Code
   */
  commandsWysiwygCommandCodeLabel = 'commands.wysiwyg.command.code.label',
  /**
   * Add inline code snippet
   */
  commandsWysiwygCommandCodeDetail = 'commands.wysiwyg.command.code.detail',
  /**
   * Code block
   */
  commandsWysiwygCommandCodeblockLabel = 'commands.wysiwyg.command.codeblock.label',
  /**
   * Add a code block
   */
  commandsWysiwygCommandCodeblockDetail = 'commands.wysiwyg.command.codeblock.detail',
  /**
   * Blockquote
   */
  commandsWysiwygCommandBlockquoteLabel = 'commands.wysiwyg.command.blockquote.label',
  /**
   * Add a blockquote
   */
  commandsWysiwygCommandBlockquoteDetail = 'commands.wysiwyg.command.blockquote.detail',
  /**
   * Strikethrough
   */
  commandsWysiwygCommandStrikethroughLabel = 'commands.wysiwyg.command.strikethrough.label',
  /**
   * Add strikethrough text
   */
  commandsWysiwygCommandStrikethroughDetail = 'commands.wysiwyg.command.strikethrough.detail',
  /**
   * WYSIWYG Options
   */
  commandsWysiwygQuickPickTitle = 'commands.wysiwyg.quickPick.title',
  /**
   * Which type of markup would you like to insert?
   */
  commandsWysiwygQuickPickPlaceholder = 'commands.wysiwyg.quickPick.placeholder',
  /**
   * WYSIWYG Hyperlink
   */
  commandsWysiwygAddHyperlinkHyperlinkInputTitle = 'commands.wysiwyg.addHyperlink.hyperlinkInput.title',
  /**
   * Enter the URL
   */
  commandsWysiwygAddHyperlinkHyperlinkInputPrompt = 'commands.wysiwyg.addHyperlink.hyperlinkInput.prompt',
  /**
   * WYSIWYG Text
   */
  commandsWysiwygAddHyperlinkTextInputTitle = 'commands.wysiwyg.addHyperlink.textInput.title',
  /**
   * Enter the text for the hyperlink
   */
  commandsWysiwygAddHyperlinkTextInputPrompt = 'commands.wysiwyg.addHyperlink.textInput.prompt',
  /**
   * Heading level
   */
  commandsWysiwygInsertTextHeadingInputTitle = 'commands.wysiwyg.insertText.heading.input.title',
  /**
   * Which heading level do you want to insert?
   */
  commandsWysiwygInsertTextHeadingInputPlaceholder = 'commands.wysiwyg.insertText.heading.input.placeholder',
  /**
   * A page bundle with the name {0} already exists in {1}.
   */
  helpersArticleHelperCreateContentPageBundleError = 'helpers.articleHelper.createContent.pageBundle.error',
  /**
   * Content with the title already exists. Please specify a new title.
   */
  helpersArticleHelperCreateContentContentExistsWarning = 'helpers.articleHelper.createContent.contentExists.warning',
  /**
   * Error while processing the {0} placeholder.
   */
  helpersArticleHelperProcessCustomPlaceholdersPlaceholderError = 'helpers.articleHelper.processCustomPlaceholders.placeholder.error',
  /**
   * Error parsing the front matter of {0}.
   */
  helpersArticleHelperParseFileDiagnosticError = 'helpers.articleHelper.parseFile.diagnostic.error',
  /**
   * No front matter data found to generate a content type.
   */
  helpersContentTypeGenerateNoFrontMatterError = 'helpers.contentType.generate.noFrontMatter.error',
  /**
   * Override the default content type
   */
  helpersContentTypeGenerateOverrideQuickPickTitle = 'helpers.contentType.generate.override.quickPick.title',
  /**
   * Do you want to overwrite the default content type configuration with the fields used in the current field?
   */
  helpersContentTypeGenerateOverrideQuickPickPlaceholder = 'helpers.contentType.generate.override.quickPick.placeholder',
  /**
   * Generate Content Type
   */
  helpersContentTypeGenerateContentTypeInputTitle = 'helpers.contentType.generate.contentTypeInput.title',
  /**
   * Enter the name of the content type to generate
   */
  helpersContentTypeGenerateContentTypeInputPrompt = 'helpers.contentType.generate.contentTypeInput.prompt',
  /**
   * Please enter a name for the content type.
   */
  helpersContentTypeGenerateContentTypeInputValidationEnterName = 'helpers.contentType.generate.contentTypeInput.validation.enterName',
  /**
   * A content type with this name already exists.
   */
  helpersContentTypeGenerateContentTypeInputValidationNameExists = 'helpers.contentType.generate.contentTypeInput.validation.nameExists',
  /**
   * You didn't specify a name for the content type.
   */
  helpersContentTypeGenerateNoContentTypeNameWarning = 'helpers.contentType.generate.noContentTypeName.warning',
  /**
   * Use as a page bundle
   */
  helpersContentTypeGeneratePageBundleQuickPickTitle = 'helpers.contentType.generate.pageBundle.quickPick.title',
  /**
   * Do you want to use this content type as a page bundle?
   */
  helpersContentTypeGeneratePageBundleQuickPickPlaceHolder = 'helpers.contentType.generate.pageBundle.quickPick.placeHolder',
  /**
   * Content type {0} has been updated.
   */
  helpersContentTypeGenerateUpdatedSuccess = 'helpers.contentType.generate.updated.success',
  /**
   * Content type {0} has been generated.
   */
  helpersContentTypeGenerateGeneratedSuccess = 'helpers.contentType.generate.generated.success',
  /**
   * No front matter data found to add missing fields.
   */
  helpersContentTypeAddMissingFieldsNoFrontMatterWarning = 'helpers.contentType.addMissingFields.noFrontMatter.warning',
  /**
   * Content type {0} has been updated.
   */
  helpersContentTypeAddMissingFieldsUpdatedSuccess = 'helpers.contentType.addMissingFields.updated.success',
  /**
   * No front matter data found to set the content type.
   */
  helpersContentTypeSetContentTypeNoFrontMatterWarning = 'helpers.contentType.setContentType.noFrontMatter.warning',
  /**
   * Select the content type
   */
  helpersContentTypeSetContentTypeQuickPickTitle = 'helpers.contentType.setContentType.quickPick.title',
  /**
   * Which content type would you like to use?
   */
  helpersContentTypeSetContentTypeQuickPickPlaceholder = 'helpers.contentType.setContentType.quickPick.placeholder',
  /**
   * {0}: Creating content...
   */
  helpersContentTypeCreateProgressTitle = 'helpers.contentType.create.progress.title',
  /**
   * Your new content has been created.
   */
  helpersContentTypeCreateSuccess = 'helpers.contentType.create.success',
  /**
   * The content type actions are not available in this mode.
   */
  helpersContentTypeVerifyWarning = 'helpers.contentType.verify.warning',
  /**
   * Executing: {0}
   */
  helpersCustomScriptExecuting = 'helpers.customScript.executing',
  /**
   * {0}: Article couldn't be retrieved.
   */
  helpersCustomScriptSingleRunArticleWarning = 'helpers.customScript.singleRun.article.warning',
  /**
   * {0}: No files found
   */
  helpersCustomScriptBulkRunNoFilesWarning = 'helpers.customScript.bulkRun.noFiles.warning',
  /**
   * {0}: There was no folder or media path specified.
   */
  helpersCustomScriptRunMediaScriptNoFolderWarning = 'helpers.customScript.runMediaScript.noFolder.warning',
  /**
   * {0}: front matter updated.
   */
  helpersCustomScriptShowOutputFrontMatterSuccess = 'helpers.customScript.showOutput.frontMatter.success',
  /**
   * Copy output
   */
  helpersCustomScriptShowOutputCopyOutputAction = 'helpers.customScript.showOutput.copyOutput.action',
  /**
   * {0}: Executed your custom script.
   */
  helpersCustomScriptShowOutputSuccess = 'helpers.customScript.showOutput.success',
  /**
   * Invalid command: {0}
   */
  helpersCustomScriptValidateCommandError = 'helpers.customScript.validateCommand.error',
  /**
   * Something went wrong while processing the data file.
   */
  helpersDataFileHelperProcessError = 'helpers.dataFileHelper.process.error',
  /**
   * Check the changelog
   */
  helpersExtensionGetVersionChangelog = 'helpers.extension.getVersion.changelog',
  /**
   * Give it a ⭐️
   */
  helpersExtensionGetVersionStarIt = 'helpers.extension.getVersion.starIt',
  /**
   * {0} has been updated to v{1} — check out what's new!
   */
  helpersExtensionGetVersionUpdateNotification = 'helpers.extension.getVersion.update.notification',
  /**
   * The "{0}" and "{1}" settings have been deprecated. Please use the "isPublishDate" and "isModifiedDate" datetime field properties instead.
   */
  helpersExtensionMigrateSettingsDeprecatedWarning = 'helpers.extension.migrateSettings.deprecated.warning',
  /**
   * Hide
   */
  helpersExtensionMigrateSettingsDeprecatedWarningHide = 'helpers.extension.migrateSettings.deprecated.warning.hide',
  /**
   * See migration guide
   */
  helpersExtensionMigrateSettingsDeprecatedWarningSeeGuide = 'helpers.extension.migrateSettings.deprecated.warning.seeGuide',
  /**
   * {0} - Templates
   */
  helpersExtensionMigrateSettingsTemplatesQuickPickTitle = 'helpers.extension.migrateSettings.templates.quickPick.title',
  /**
   * Do you want to keep on using the template functionality?
   */
  helpersExtensionMigrateSettingsTemplatesQuickPickPlaceholder = 'helpers.extension.migrateSettings.templates.quickPick.placeholder',
  /**
   * Front Matter BETA cannot be used while the stable version is installed. Please ensure that you have only over version installed.
   */
  helpersExtensionCheckIfExtensionCanRunWarning = 'helpers.extension.checkIfExtensionCanRun.warning',
  /**
   * We couldn't find your selected folder.
   */
  helpersMediaHelperSaveFileFolderError = 'helpers.mediaHelper.saveFile.folder.error',
  /**
   * File {0} uploaded to: {1}
   */
  helpersMediaHelperSaveFileFileUploadedSuccess = 'helpers.mediaHelper.saveFile.file.uploaded.success',
  /**
   * Sorry, something went wrong uploading {0}
   */
  helpersMediaHelperSaveFileFileUploadedFailed = 'helpers.mediaHelper.saveFile.file.uploaded.failed',
  /**
   * Sorry, something went wrong deleting {0}
   */
  helpersMediaHelperDeleteFileFileDeletionFailed = 'helpers.mediaHelper.deleteFile.file.deletion.failed',
  /**
   * The name "{0}" already exists at the file location.
   */
  helpersMediaLibraryRemoveWarning = 'helpers.mediaLibrary.remove.warning',
  /**
   * Sorry, something went wrong updating "{0}" to "{1}".
   */
  helpersMediaLibraryRemoveError = 'helpers.mediaLibrary.remove.error',
  /**
   * Couldn't open the file.
   */
  helpersOpenFileInEditorError = 'helpers.openFileInEditor.error',
  /**
   * Title or description
   */
  helpersQuestionsContentTitleAiInputTitle = 'helpers.questions.contentTitle.aiInput.title',
  /**
   * What would you like to write about?
   */
  helpersQuestionsContentTitleAiInputPrompt = 'helpers.questions.contentTitle.aiInput.prompt',
  /**
   * What would you like to write about?
   */
  helpersQuestionsContentTitleAiInputPlaceholder = 'helpers.questions.contentTitle.aiInput.placeholder',
  /**
   * your title/description
   */
  helpersQuestionsContentTitleAiInputQuickPickTitleSeparator = 'helpers.questions.contentTitle.aiInput.quickPick.title.separator',
  /**
   * AI generated title
   */
  helpersQuestionsContentTitleAiInputQuickPickAiSeparator = 'helpers.questions.contentTitle.aiInput.quickPick.ai.separator',
  /**
   * Select a title
   */
  helpersQuestionsContentTitleAiInputSelectTitle = 'helpers.questions.contentTitle.aiInput.select.title',
  /**
   * Select a title for your content
   */
  helpersQuestionsContentTitleAiInputSelectPlaceholder = 'helpers.questions.contentTitle.aiInput.select.placeholder',
  /**
   * Failed fetching the AI title. Please try to use your own title or try again later.
   */
  helpersQuestionsContentTitleAiInputFailed = 'helpers.questions.contentTitle.aiInput.failed',
  /**
   * You did not specify a title for your content.
   */
  helpersQuestionsContentTitleAiInputWarning = 'helpers.questions.contentTitle.aiInput.warning',
  /**
   * Content title
   */
  helpersQuestionsContentTitleTitleInputTitle = 'helpers.questions.contentTitle.titleInput.title',
  /**
   * What would you like to use as a title for the content to create?
   */
  helpersQuestionsContentTitleTitleInputPrompt = 'helpers.questions.contentTitle.titleInput.prompt',
  /**
   * Content title
   */
  helpersQuestionsContentTitleTitleInputPlaceholder = 'helpers.questions.contentTitle.titleInput.placeholder',
  /**
   * You did not specify a title for your content.
   */
  helpersQuestionsContentTitleTitleInputWarning = 'helpers.questions.contentTitle.titleInput.warning',
  /**
   * Select a folder
   */
  helpersQuestionsSelectContentFolderQuickPickTitle = 'helpers.questions.selectContentFolder.quickPick.title',
  /**
   * Select where you want to create your content
   */
  helpersQuestionsSelectContentFolderQuickPickPlaceholder = 'helpers.questions.selectContentFolder.quickPick.placeholder',
  /**
   * No page folders were configured.
   */
  helpersQuestionsSelectContentFolderQuickPickNoFoldersWarning = 'helpers.questions.selectContentFolder.quickPick.noFolders.warning',
  /**
   * You didn't select a place where you wanted to create your content.
   */
  helpersQuestionsSelectContentFolderQuickPickNoSelectionWarning = 'helpers.questions.selectContentFolder.quickPick.noSelection.warning',
  /**
   * No content types found. Please create a content type first.
   */
  helpersQuestionsSelectContentTypeNoContentTypeWarning = 'helpers.questions.selectContentType.noContentType.warning',
  /**
   * Content type
   */
  helpersQuestionsSelectContentTypeQuickPickTitle = 'helpers.questions.selectContentType.quickPick.title',
  /**
   * Select the content type to create your new content
   */
  helpersQuestionsSelectContentTypeQuickPickPlaceholder = 'helpers.questions.selectContentType.quickPick.placeholder',
  /**
   * No content type was selected.
   */
  helpersQuestionsSelectContentTypeNoSelectionWarning = 'helpers.questions.selectContentType.noSelection.warning',
  /**
   * Article {0} is longer than {1} characters (current length: {2}). For SEO reasons, it would be better to make it less than {1} characters.
   */
  helpersSeoHelperCheckLengthDiagnosticMessage = 'helpers.seoHelper.checkLength.diagnostic.message',
  /**
   * You have local settings. Would you like to promote them to the global settings ("frontmatter.json")?
   */
  helpersSettingsHelperCheckToPromoteMessage = 'helpers.settingsHelper.checkToPromote.message',
  /**
   * All settings promoted to team level.
   */
  helpersSettingsHelperPromoteSuccess = 'helpers.settingsHelper.promote.success',
  /**
   * {0}: Reading dynamic config file...
   */
  helpersSettingsHelperReadConfigProgressTitle = 'helpers.settingsHelper.readConfig.progress.title',
  /**
   * Error reading your configuration.
   */
  helpersSettingsHelperReadConfigError = 'helpers.settingsHelper.readConfig.error',
  /**
   * Settings have been refreshed.
   */
  helpersSettingsHelperRefreshConfigSuccess = 'helpers.settingsHelper.refreshConfig.success',
  /**
   * Rename the {0}
   */
  helpersTaxonomyHelperRenameInputTitle = 'helpers.taxonomyHelper.rename.input.title',
  /**
   * The new value must be different from the old one.
   */
  helpersTaxonomyHelperRenameValidateEqualValue = 'helpers.taxonomyHelper.rename.validate.equalValue',
  /**
   * A new value must be provided.
   */
  helpersTaxonomyHelperRenameValidateNoValue = 'helpers.taxonomyHelper.rename.validate.noValue',
  /**
   * Merge the "{0}" with another {1} value
   */
  helpersTaxonomyHelperMergeQuickPickTitle = 'helpers.taxonomyHelper.merge.quickPick.title',
  /**
   * Select the {0} value to merge with
   */
  helpersTaxonomyHelperMergeQuickPickPlaceholder = 'helpers.taxonomyHelper.merge.quickPick.placeholder',
  /**
   * Delete the "{0}" {1} value
   */
  helpersTaxonomyHelperDeleteQuickPickTitle = 'helpers.taxonomyHelper.delete.quickPick.title',
  /**
   * Are you sure you want to delete the "{0}" {1} value?
   */
  helpersTaxonomyHelperDeleteQuickPickPlaceholder = 'helpers.taxonomyHelper.delete.quickPick.placeholder',
  /**
   * Create a new {0} value
   */
  helpersTaxonomyHelperCreateNewInputTitle = 'helpers.taxonomyHelper.createNew.input.title',
  /**
   * Enter the value you want to add
   */
  helpersTaxonomyHelperCreateNewInputPlaceholder = 'helpers.taxonomyHelper.createNew.input.placeholder',
  /**
   * A value must be provided.
   */
  helpersTaxonomyHelperCreateNewInputValidateNoValue = 'helpers.taxonomyHelper.createNew.input.validate.noValue',
  /**
   * The value already exists.
   */
  helpersTaxonomyHelperCreateNewInputValidateExists = 'helpers.taxonomyHelper.createNew.input.validate.exists',
  /**
   * {0}: Renaming "{1}" from {2} to {3}.
   */
  helpersTaxonomyHelperProcessEdit = 'helpers.taxonomyHelper.process.edit',
  /**
   * {0}: Merging "{1}" from {2} to {3}.
   */
  helpersTaxonomyHelperProcessMerge = 'helpers.taxonomyHelper.process.merge',
  /**
   * {0}: Deleting "{1}" from {2}.
   */
  helpersTaxonomyHelperProcessDelete = 'helpers.taxonomyHelper.process.delete',
  /**
   * Edit completed.
   */
  helpersTaxonomyHelperProcessEditSuccess = 'helpers.taxonomyHelper.process.edit.success',
  /**
   * Merge completed.
   */
  helpersTaxonomyHelperProcessMergeSuccess = 'helpers.taxonomyHelper.process.merge.success',
  /**
   * Deletion completed.
   */
  helpersTaxonomyHelperProcessDeleteSuccess = 'helpers.taxonomyHelper.process.delete.success',
  /**
   * Move the "{0}" to another type
   */
  helpersTaxonomyHelperMoveQuickPickTitle = 'helpers.taxonomyHelper.move.quickPick.title',
  /**
   * Select the type to move to
   */
  helpersTaxonomyHelperMoveQuickPickPlaceholder = 'helpers.taxonomyHelper.move.quickPick.placeholder',
  /**
   * {0}: Moving "{1}" from {2} to "${3}".
   */
  helpersTaxonomyHelperMoveProgressTitle = 'helpers.taxonomyHelper.move.progress.title',
  /**
   * Move completed.
   */
  helpersTaxonomyHelperMoveSuccess = 'helpers.taxonomyHelper.move.success',
  /**
   * Open the "frontmatter.json" file if you want to review the configuration.
   */
  listenersDashboardDashboardListenerOpenConfigNotification = 'listeners.dashboard.dashboardListener.openConfig.notification',
  /**
   * No path provided.
   */
  listenersDashboardDashboardListenerPinItemNoPathError = 'listeners.dashboard.dashboardListener.pinItem.noPath.error',
  /**
   * Could not pin item.
   */
  listenersDashboardDashboardListenerPinItemCoundNotPinError = 'listeners.dashboard.dashboardListener.pinItem.coundNotPin.error',
  /**
   * Could not unpin item.
   */
  listenersDashboardDashboardListenerPinItemCoundNotUnPinError = 'listeners.dashboard.dashboardListener.pinItem.coundNotUnPin.error',
  /**
   * Template files copied.
   */
  listenersDashboardSettingsListenerTriggerTemplateNotification = 'listeners.dashboard.settingsListener.triggerTemplate.notification',
  /**
   * Downloading and initializing the template...
   */
  listenersDashboardSettingsListenerTriggerTemplateProgressTitle = 'listeners.dashboard.settingsListener.triggerTemplate.progress.title',
  /**
   * Failed to download the template.
   */
  listenersDashboardSettingsListenerTriggerTemplateDownloadError = 'listeners.dashboard.settingsListener.triggerTemplate.download.error',
  /**
   * Failed to initialize the template.
   */
  listenersDashboardSettingsListenerTriggerTemplateInitError = 'listeners.dashboard.settingsListener.triggerTemplate.init.error',
  /**
   * Snippet missing title or body
   */
  listenersDashboardSnippetListenerAddSnippetMissingFieldsWarning = 'listeners.dashboard.snippetListener.addSnippet.missingFields.warning',
  /**
   * Snippet with the same title already exists
   */
  listenersDashboardSnippetListenerAddSnippetExistsWarning = 'listeners.dashboard.snippetListener.addSnippet.exists.warning',
  /**
   * No snippets to update
   */
  listenersDashboardSnippetListenerUpdateSnippetNoSnippetsWarning = 'listeners.dashboard.snippetListener.updateSnippet.noSnippets.warning',
  /**
   * Failed to push submodules.
   */
  listenersGeneralGitListenerPushError = 'listeners.general.gitListener.push.error',
  /**
   * No active editor
   */
  listenersPanelDataListenerAiSuggestTaxonomyNoEditorError = 'listeners.panel.dataListener.aiSuggestTaxonomy.noEditor.error',
  /**
   * No article data
   */
  listenersPanelDataListenerAiSuggestTaxonomyNoDataError = 'listeners.panel.dataListener.aiSuggestTaxonomy.noData.error',
  /**
   * Couldn't find data file entries
   */
  listenersPanelDataListenerGetDataFileEntriesNoDataFilesError = 'listeners.panel.dataListener.getDataFileEntries.noDataFiles.error',
  /**
   * No active editor
   */
  listenersPanelTaxonomyListenerAiSuggestTaxonomyNoEditorError = 'listeners.panel.taxonomyListener.aiSuggestTaxonomy.noEditor.error',
  /**
   * No article data
   */
  listenersPanelTaxonomyListenerAiSuggestTaxonomyNoDataError = 'listeners.panel.taxonomyListener.aiSuggestTaxonomy.noData.error',
  /**
   * Select the mode you want to use
   */
  servicesModeSwitchSwitchModeQuickPickPlaceholder = 'services.modeSwitch.switchMode.quickPick.placeholder',
  /**
   * {0}: Mode selection
   */
  servicesModeSwitchSwitchModeQuickPickTitle = 'services.modeSwitch.switchMode.quickPick.title',
  /**
   * Mode: {0}
   */
  servicesModeSwitchSetTextMode = 'services.modeSwitch.setText.mode',
  /**
   * Processing...
   */
  servicesPagesParserParsePagesStatusBarText = 'services.pagesParser.parsePages.statusBar.text',
  /**
   * File error: {0}
   */
  servicesPagesParserParsePagesFileError = 'services.pagesParser.parsePages.file.error',
  /**
   * The AI title generation took too long. Please try again later.
   */
  servicesSponsorAiGetTitlesWarning = 'services.sponsorAi.getTitles.warning',
  /**
   * The AI description generation took too long. Please try again later.
   */
  servicesSponsorAiGetDescriptionWarning = 'services.sponsorAi.getDescription.warning',
  /**
   * The AI taxonomy generation took too long. Please try again later.
   */
  servicesSponsorAiGetTaxonomySuggestionsWarning = 'services.sponsorAi.getTaxonomySuggestions.warning',
  /**
   * Starting local server
   */
  servicesTerminalOpenLocalServerTerminalTerminalOptionMessage = 'services.terminal.openLocalServerTerminal.terminalOption.message'
}
