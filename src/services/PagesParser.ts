import { STATIC_FOLDER_PLACEHOLDER } from './../constants/StaticFolderPlaceholder';
import { parseWinPath } from './../helpers/parseWinPath';
import { dirname, extname, join } from 'path';
import { StatusBarAlignment, Uri, window } from 'vscode';
import { Dashboard } from '../commands/Dashboard';
import { Folders } from '../commands/Folders';
import {
  DefaultFields,
  DEFAULT_CONTENT_TYPE_NAME,
  ExtensionState,
  SETTING_SEO_DESCRIPTION_FIELD,
  SETTING_SEO_TITLE_FIELD,
  SETTING_DATE_FORMAT
} from '../constants';
import { Page } from '../dashboardWebView/models';
import {
  ArticleHelper,
  ContentType,
  DateHelper,
  Extension,
  FilesHelper,
  isValidFile,
  Logger,
  Notifications,
  Settings
} from '../helpers';
import { existsAsync } from '../utils';
import { Article, Cache } from '../commands';

export class PagesParser {
  public static allPages: Page[] = [];
  public static cachedPages: Page[] | undefined = undefined;
  private static parser: Promise<void> | undefined;
  private static initialized: boolean = false;
  private static pagesStatusBar = window.createStatusBarItem(StatusBarAlignment.Left);

  /**
   * Start the page parser
   */
  public static start() {
    if (!this.parser) {
      this.parser = this.parsePages();
    }
  }

  /**
   * Retrieve the pages
   * @param cb
   */
  public static getPages(cb: (pages: Page[]) => void) {
    if (this.parser) {
      this.parser.then(() => cb(PagesParser.allPages));
    } else if (!PagesParser.initialized) {
      this.parser = this.parsePages();
      this.parser.then(() => cb(PagesParser.allPages));
    } else if (PagesParser.allPages === undefined || PagesParser.allPages.length === 0) {
      this.parser = this.parsePages();
      this.parser.then(() => cb(PagesParser.allPages));
    } else {
      cb(PagesParser.allPages);
    }
  }

  /**
   * Reset the cache
   */
  public static async reset() {
    this.parser = undefined;
    PagesParser.allPages = [];
    await Cache.clear(false);
  }

  /**
   * Parse all pages in the workspace
   */
  public static async parsePages() {
    const ext = Extension.getInstance();

    // Update the dashboard with the fresh data
    const folderInfo = await Folders.getInfo();
    const pages: Page[] = [];

    if (folderInfo) {
      PagesParser.pagesStatusBar.text = '$(sync~spin) Processing pages...';
      PagesParser.pagesStatusBar.show();

      for (const folder of folderInfo) {
        for (const file of folder.lastModified) {
          if (isValidFile(file.fileName)) {
            try {
              let page = await PagesParser.getCachedPage(file.filePath, file.mtime);

              if (!page) {
                page = await this.processPageContent(
                  file.filePath,
                  file.mtime,
                  file.fileName,
                  folder.title
                );
              }

              if (page && !pages.find((p) => p.fmFilePath === page?.fmFilePath)) {
                pages.push(page);
              }
            } catch (error: any) {
              if ((error as Error)?.message.toLowerCase() === 'webview is disposed') {
                continue;
              }

              Logger.error(`PagesParser::parsePages: ${file.filePath} - ${error.message}`);
              Notifications.error(`File error: ${file.filePath} - ${error?.message || error}`);
            }
          }
        }
      }
    }

    await ext.setState(ExtensionState.Dashboard.Pages.Cache, pages, 'workspace');
    PagesParser.cachedPages = undefined;

    this.parser = undefined;
    this.initialized = true;
    PagesParser.allPages = [...pages];
    PagesParser.pagesStatusBar.hide();
  }

  /**
   * Find the page in the cached data
   * @param filePath
   * @param modifiedTime
   * @returns
   */
  public static async getCachedPage(
    filePath: string,
    modifiedTime: number
  ): Promise<Page | undefined> {
    if (!PagesParser.cachedPages) {
      const ext = Extension.getInstance();
      PagesParser.cachedPages =
        (await ext.getState<Page[]>(ExtensionState.Dashboard.Pages.Cache, 'workspace')) || [];
    }

    return PagesParser.cachedPages.find(
      (p) => p.fmCachePath === parseWinPath(filePath) && p.fmCacheModifiedTime === modifiedTime
    );
  }

  /**
   * Process the page content
   * @param filePath
   * @param fileMtime
   * @param fileName
   * @param folderTitle
   * @returns
   */
  public static async processPageContent(
    filePath: string,
    fileMtime: number,
    fileName: string,
    folderTitle: string
  ): Promise<Page | undefined> {
    const article = await ArticleHelper.getFrontMatterByPath(filePath);

    if (article?.data) {
      const wsFolder = Folders.getWorkspaceFolder();

      const titleField = (Settings.get(SETTING_SEO_TITLE_FIELD) as string) || DefaultFields.Title;

      const descriptionField =
        (Settings.get(SETTING_SEO_DESCRIPTION_FIELD) as string) || DefaultFields.Description;

      const dateField = ArticleHelper.getPublishDateField(article) || DefaultFields.PublishingDate;

      const contentType = ArticleHelper.getContentType(article);
      let dateFormat = Settings.get(SETTING_DATE_FORMAT) as string;
      const ctDateField = ContentType.findFieldByName(contentType.fields, dateField);
      if (ctDateField && ctDateField.dateFormat) {
        dateFormat = ctDateField.dateFormat;
      }

      const dateFieldValue = article?.data[dateField]
        ? DateHelper.tryParse(article?.data[dateField], dateFormat)
        : undefined;

      const modifiedField = ArticleHelper.getModifiedDateField(article) || null;
      const modifiedFieldValue =
        modifiedField && article?.data[modifiedField]
          ? DateHelper.tryParse(article?.data[modifiedField])?.getTime()
          : undefined;

      const staticFolder = Folders.getStaticFolderRelativePath();

      let escapedTitle = article?.data[titleField] || fileName;
      if (escapedTitle && typeof escapedTitle !== 'string') {
        escapedTitle = '<invalid title>';
      }

      let escapedDescription = article?.data[descriptionField] || '';
      if (escapedDescription && typeof escapedDescription !== 'string') {
        escapedDescription = '<invalid title>';
      }

      const page: Page = {
        ...article.data,
        // Cache properties
        fmCachePath: parseWinPath(filePath),
        fmCacheModifiedTime: fileMtime,
        // FrontMatter properties
        fmFolder: folderTitle,
        fmFilePath: filePath,
        fmRelFileWsPath: FilesHelper.absToRelPath(filePath),
        fmRelFilePath: parseWinPath(filePath).replace(wsFolder?.fsPath || '', ''),
        fmFileName: fileName,
        fmDraft: ContentType.getDraftStatus(article),
        fmModified: modifiedFieldValue ? modifiedFieldValue : fileMtime,
        fmPublished: dateFieldValue ? dateFieldValue.getTime() : null,
        fmYear: dateFieldValue ? dateFieldValue.getFullYear() : null,
        fmPreviewImage: '',
        fmTags: [],
        fmCategories: [],
        fmContentType: contentType.name || DEFAULT_CONTENT_TYPE_NAME,
        fmBody: article?.content || '',
        fmDateFormat: dateFormat,
        // Make sure these are always set
        title: escapedTitle,
        description: escapedDescription,
        slug: article?.data.slug || Article.generateSlug(escapedTitle)?.slugWithPrefixAndSuffix,
        date: article?.data[dateField] || '',
        draft: article?.data.draft
      };

      let previewFieldParents = ContentType.findPreviewField(contentType.fields);
      if (previewFieldParents.length === 0) {
        const previewField = contentType.fields.find(
          (field) => field.type === 'image' && field.name === 'preview'
        );
        if (previewField) {
          previewFieldParents = ['preview'];
        }
      }
      // Retrieve the tags from the artilce
      let tagParents = ContentType.findFieldsByTypeDeep(contentType.fields, 'tags');
      if (tagParents.length > 0) {
        const firstField = tagParents[0];
        if (firstField.length > 0) {
          const tagsValue = ContentType.getFieldValue(
            article.data,
            firstField.map((f) => f.name)
          );
          page.fmTags = typeof tagsValue === 'string' ? tagsValue.split(',') : tagsValue;
        }
      }

      // Retrieve the categories from the artilce
      let categoryParents = ContentType.findFieldsByTypeDeep(contentType.fields, 'categories');
      if (categoryParents.length > 0) {
        const firstField = categoryParents[0];
        if (firstField.length > 0) {
          const categoriesValue = ContentType.getFieldValue(
            article.data,
            firstField.map((f) => f.name)
          );
          page.fmCategories =
            typeof categoriesValue === 'string' ? categoriesValue.split(',') : categoriesValue;
        }
      }

      // Check if parent fields were retrieved, if not there was no image present
      if (previewFieldParents.length > 0) {
        let fieldValue = null;
        let crntPageData = article?.data;

        for (let i = 0; i < previewFieldParents.length; i++) {
          const previewField = previewFieldParents[i];

          if (i === previewFieldParents.length - 1) {
            fieldValue = crntPageData[previewField];
          } else {
            if (!crntPageData[previewField]) {
              continue;
            }

            crntPageData = crntPageData[previewField];

            // Check for preview image in block data
            if (crntPageData instanceof Array && crntPageData.length > 0) {
              // Get the first field block that contains the next field data
              const fieldData = crntPageData.find((item) => item[previewFieldParents[i + 1]]);
              if (fieldData) {
                crntPageData = fieldData;
              } else {
                continue;
              }
            }
          }
        }

        if (fieldValue && wsFolder) {
          if (fieldValue && Array.isArray(fieldValue)) {
            if (fieldValue.length > 0) {
              fieldValue = fieldValue[0];
            } else {
              fieldValue = undefined;
            }
          }

          // Revalidate as the array could have been empty
          if (fieldValue) {
            // Check if the value already starts with https - if that is the case, it is an external image
            if (fieldValue.startsWith('http')) {
              page.fmPreviewImage = fieldValue;
            } else {
              let staticPath = join(wsFolder.fsPath, staticFolder || '', fieldValue);

              if (staticFolder === STATIC_FOLDER_PLACEHOLDER.hexo.placeholder) {
                const crntFilePath = parseWinPath(filePath);
                const pathWithoutExtension = crntFilePath.replace(extname(crntFilePath), '');
                staticPath = join(pathWithoutExtension, fieldValue);
              }

              const contentFolderPath = join(dirname(filePath), fieldValue);

              let previewUri = null;
              if (await existsAsync(staticPath)) {
                previewUri = Uri.file(staticPath);
              } else if (await existsAsync(contentFolderPath)) {
                previewUri = Uri.file(contentFolderPath);
              }

              if (previewUri) {
                let previewPath: string = '';

                const Webview = Dashboard.getWebview();
                if (Webview) {
                  previewPath = Webview.asWebviewUri(previewUri).toString();
                } else {
                  previewPath = PagesParser.getWebviewUri(previewUri).toString();
                }

                page['fmPreviewImage'] = previewPath || '';
              }
            }
          }
        }
      }

      return page;
    }

    return;
  }

  /**
   * Get the webview URI
   * @param resource
   * @returns
   */
  private static getWebviewUri(resource: Uri) {
    // Logic from: https://github.com/microsoft/vscode/blob/main/src/vs/workbench/common/webview.ts
    const webviewResourceBaseHost = 'vscode-cdn.net';
    const webviewRootResourceAuthority = `vscode-resource.${webviewResourceBaseHost}`;

    const authority = `${resource.scheme}+${encodeURI(
      resource.authority
    )}.${webviewRootResourceAuthority}`;
    return Uri.from({
      scheme: 'https',
      authority,
      path: parseWinPath(resource.path),
      query: resource.query,
      fragment: resource.fragment
    });
  }
}
