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
   * Pin
   */
  commonPin = 'common.pin',
  /**
   * Unpin
   */
  commonUnpin = 'common.unpin',
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
   * The following Astro Content Collections and can be used to generate a content-type.
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
   * Open preview
   */
  panelBaseViewActionOpenPreview = 'panel.baseView.action.openPreview',
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
   * Template files copied.
   */
  listenersDashboardSettingsListenerTriggerTemplateNotification = 'listeners.dashboard.settingsListener.triggerTemplate.notification'
}
