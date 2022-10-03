import { parseWinPath } from './../helpers/parseWinPath';
import { existsSync } from "fs";
import { dirname, join } from "path";
import { StatusBarAlignment, Uri, window } from "vscode";
import { Dashboard } from "../commands/Dashboard";
import { Folders } from "../commands/Folders";
import { DefaultFields, DEFAULT_CONTENT_TYPE_NAME, ExtensionState, SETTING_SEO_DESCRIPTION_FIELD } from "../constants";
import { Page } from "../dashboardWebView/models";
import { ArticleHelper, ContentType, DateHelper, Extension, isValidFile, Logger, Notifications, Settings } from "../helpers";


export class PagesParser {
  public static allPages: Page[] = [];
  public static cachedPages: Page[] | undefined = undefined;
  private static parser: Promise<void> | undefined;
  private static initialized: boolean = false;

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
  }

  /**
   * Parse all pages in the workspace
   */
  public static async parsePages() {
    const ext = Extension.getInstance();

    // Update the dashboard with the fresh data
    const folderInfo = await Folders.getInfo();
    const pages: Page[] = [];
    const statusBar = window.createStatusBarItem(StatusBarAlignment.Left);

    if (folderInfo) {
      statusBar.text = '$(sync~spin) Processing pages...';
      statusBar.show();

      for (const folder of folderInfo) {
        for (const file of folder.lastModified) {
          if (isValidFile(file.fileName)) {
            try {
              let page = await PagesParser.getCachedPage(file.filePath, file.mtime);

              if (!page) {
                page = this.processPageContent(file.filePath, file.mtime, file.fileName, folder.title);
              }

              if (page && !pages.find(p => p.fmFilePath === page?.fmFilePath)) {
                pages.push(page);
              }
            } catch (error: any) {
              if ((error as Error)?.message.toLowerCase() === "webview is disposed") {
                continue;
              }

              Logger.error(`PagesParser::parsePages: ${file.filePath} - ${error.message}`);
              Notifications.error(`File error: ${file.filePath} - ${error?.message || error}`);
            }
          }
        }
      }
    }

    await ext.setState(ExtensionState.Dashboard.Pages.Cache, pages, "workspace");
    PagesParser.cachedPages = undefined;

    this.parser = undefined;
    this.initialized = true;
    PagesParser.allPages = [...pages];
    statusBar.hide();
  }

  /**
   * Find the page in the cached data
   * @param filePath 
   * @param modifiedTime 
   * @returns 
   */
  public static async getCachedPage(filePath: string, modifiedTime: number): Promise<Page | undefined> {
    if (!PagesParser.cachedPages) {
      const ext = Extension.getInstance();
      PagesParser.cachedPages = await ext.getState<Page[]>(ExtensionState.Dashboard.Pages.Cache, "workspace") || [];
    }

    return PagesParser.cachedPages.find(p => p.fmCachePath === parseWinPath(filePath) && p.fmCacheModifiedTime === modifiedTime);
  }

  /**
   * Process the page content
   * @param filePath 
   * @param fileMtime 
   * @param fileName 
   * @param folderTitle 
   * @returns 
   */
  public static processPageContent(filePath: string, fileMtime: number, fileName: string, folderTitle: string): Page | undefined {
    const article = ArticleHelper.getFrontMatterByPath(filePath);

    if (article?.data.title) {
      const wsFolder = Folders.getWorkspaceFolder();
      const descriptionField = Settings.get(SETTING_SEO_DESCRIPTION_FIELD) as string || DefaultFields.Description;

      const dateField = ArticleHelper.getPublishDateField(article) || DefaultFields.PublishingDate;
      const dateFieldValue = article?.data[dateField] ? DateHelper.tryParse(article?.data[dateField]) : undefined;

      const modifiedField = ArticleHelper.getModifiedDateField(article) || null;
      const modifiedFieldValue = modifiedField && article?.data[modifiedField] ? DateHelper.tryParse(article?.data[modifiedField])?.getTime() : undefined;

      const staticFolder = Folders.getStaticFolderRelativePath();

      let escapedTitle = article?.data.title;
      if (escapedTitle && typeof escapedTitle !== "string") {
        escapedTitle = "<invalid title>";
      }

      let escapedDescription = article?.data[descriptionField] || "";
      if (escapedDescription && typeof escapedDescription !== "string") {
        escapedDescription = "<invalid title>";
      }

      const page: Page = {
        ...article.data,
        // Cache properties
        fmCachePath: parseWinPath(filePath),
        fmCacheModifiedTime: fileMtime,
        // FrontMatter properties
        fmFolder: folderTitle,
        fmFilePath: filePath,
        fmFileName: fileName,
        fmDraft: ContentType.getDraftStatus(article?.data),
        fmModified: modifiedFieldValue ? modifiedFieldValue : fileMtime,
        fmPublished: dateFieldValue ? dateFieldValue.getTime() : null,
        fmYear: dateFieldValue ? dateFieldValue.getFullYear() : null,
        fmPreviewImage: "",
        fmTags: [],
        fmCategories: [],
        fmContentType: DEFAULT_CONTENT_TYPE_NAME,
        fmBody: article?.content || "",
        // Make sure these are always set
        title: escapedTitle,
        slug: article?.data.slug,
        date: article?.data[dateField] || "",
        draft: article?.data.draft,
        description: escapedDescription,
      };

      const contentType = ArticleHelper.getContentType(article.data);
      if (contentType) {
        page.fmContentType = contentType.name;
      }

      let previewFieldParents = ContentType.findPreviewField(contentType.fields);
      if (previewFieldParents.length === 0) {
        const previewField = contentType.fields.find(field => field.type === "image" && field.name === "preview");
        if (previewField) {
          previewFieldParents = ["preview"];
        }
      }

      let tagParents = ContentType.findFieldByType(contentType.fields, "tags");
      const tagsValue = ContentType.getFieldValue(article.data, tagParents.length !== 0 ? tagParents : ["tags"]);
      page.fmTags = typeof tagsValue === "string" ? tagsValue.split(",") : tagsValue;

      let categoryParents = ContentType.findFieldByType(contentType.fields, "categories");
      const categoriesValue = ContentType.getFieldValue(article.data, categoryParents.length !== 0 ? categoryParents : ["categories"]);
      page.fmCategories = typeof categoriesValue === "string" ? categoriesValue.split(",") : categoriesValue;

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
              const fieldData = crntPageData.find(item => item[previewFieldParents[i + 1]]);
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
            const staticPath = join(wsFolder.fsPath, staticFolder || "", fieldValue);
            const contentFolderPath = join(dirname(filePath), fieldValue);
  
            let previewUri = null;
            if (existsSync(staticPath)) {
              previewUri = Uri.file(staticPath);
            } else if (existsSync(contentFolderPath)) {
              previewUri = Uri.file(contentFolderPath);
            }
  
            if (previewUri) {
              const previewPath = Dashboard.getWebview()?.asWebviewUri(previewUri);
              let preview = previewPath?.toString();

              if (!preview) {
                const fileUrl = parseWinPath(previewUri.fsPath);
                preview = `https://file%2B.vscode-resource.vscode-cdn.net/${fileUrl.startsWith(`/`) ? fileUrl.substr(1) : fileUrl}`;
              }
              
              page["fmPreviewImage"] = preview?.toString() || "";
            }
          }
        }
      }

      return page;
    }

    return;
  }
}