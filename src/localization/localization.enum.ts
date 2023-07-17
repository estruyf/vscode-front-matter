export enum LocalizationKey {
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
   * Search
   */
  commonSearch = 'common.search',
  /**
   * Save
   */
  commonSave = 'common.save',
  /**
   * Sorry, something went wrong.
   */
  commonErrorMessage = 'common.error.message',
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
   * Sync
   */
  dashboardHeaderSyncButtonLabel = 'dashboard.header.syncButton.label',
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
   * Support
   */
  dashboardLayoutSponsorSupportLabel = 'dashboard.layout.sponsor.support.label',
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
   * Title
   */
  dashboardMediaMetadataPanelFieldTitle = 'dashboard.media.metadata.panel.field.title',
  /**
   * Caption
   */
  dashboardMediaMetadataPanelFieldCaption = 'dashboard.media.metadata.panel.field.caption',
  /**
   * Alternate text
   */
  dashboardMediaMetadataPanelFieldAlt = 'dashboard.media.metadata.panel.field.alt',
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
   * Actions
   */
  panelActionsTitle = 'panel.actions.title',
  /**
   * Open dashboard
   */
  panelActionsOpenDashboard = 'panel.actions.openDashboard',
  /**
   * Open preview
   */
  panelActionsOpenPreview = 'panel.actions.openPreview',
  /**
   * Start server
   */
  panelActionsStartServer = 'panel.actions.startServer',
  /**
   * Stop server
   */
  panelActionsStopServer = 'panel.actions.stopServer',
  /**
   * Create content
   */
  panelActionsCreateContent = 'panel.actions.createContent'
}
