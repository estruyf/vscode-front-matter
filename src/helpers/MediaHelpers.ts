import { decodeBase64Image, Extension, MediaLibrary, Notifications, parseWinPath, Settings, Sorting } from ".";
import { Dashboard } from "../commands/Dashboard";
import { Folders } from "../commands/Folders";
import { DEFAULT_CONTENT_TYPE, ExtensionState, HOME_PAGE_NAVIGATION_ID, SETTING_CONTENT_STATIC_FOLDER } from "../constants";
import { SortingOption } from "../dashboardWebView/models";
import { MediaInfo, MediaPaths, SortOrder, SortType } from "../models";
import { basename, extname, join, parse, dirname, relative } from "path";
import { existsSync, readdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import { commands, Uri, workspace, window, Position } from "vscode";
import imageSize from "image-size";
import { EditorHelper } from "@estruyf/vscode";
import { SortOption } from "../dashboardWebView/constants/SortOption";
import { DataListener, MediaListener } from "../listeners/panel";
import { ArticleHelper } from "./ArticleHelper";


export class MediaHelpers {
  private static media: MediaInfo[] = [];

  /**
   * Retrieve all media files
   * @param page 
   * @param requestedFolder 
   * @param sort 
   * @returns 
   */
  public static async getMedia(page: number = 0, requestedFolder: string = '', sort: SortingOption | null = null) {
    const wsFolder = Folders.getWorkspaceFolder();
    const staticFolder = Settings.get<string>(SETTING_CONTENT_STATIC_FOLDER);
    const contentFolders = Folders.get();
    const viewData = Dashboard.viewData;
    let selectedFolder = requestedFolder;

    // Check if there are any content types that are set to use page bundles
    const contentTypes = ArticleHelper.getContentTypes();
    const pageBundleContentTypes = contentTypes.filter(ct => ct.pageBundle);

    const ext = Extension.getInstance();
    const crntSort = sort === null ? await ext.getState<SortingOption | undefined>(ExtensionState.Dashboard.Media.Sorting, "workspace") : sort;

    // If the static folder is not set, retreive the last opened location
    if (!selectedFolder) {
      const stateValue = await ext.getState<string | undefined>(ExtensionState.SelectedFolder, "workspace");

      if (stateValue !== HOME_PAGE_NAVIGATION_ID) {
        // Support for page bundles
        if (viewData?.data?.filePath && (viewData?.data?.filePath.endsWith('index.md') || viewData?.data?.filePath.endsWith('index.mdx'))) {
          const folderPath = parse(viewData.data.filePath).dir;
          selectedFolder = folderPath;
        } else if (stateValue && existsSync(stateValue)) {
          selectedFolder = stateValue;
        }
      }
    }

    // Go to the home folder
    if (selectedFolder === HOME_PAGE_NAVIGATION_ID) {
      selectedFolder = '';
    }

    let relSelectedFolderPath = selectedFolder;
    const parsedPath = parseWinPath(wsFolder?.fsPath || "");
    if (selectedFolder && selectedFolder.startsWith(parsedPath)) {
      relSelectedFolderPath = selectedFolder.replace(parsedPath, '');
    }

    if (relSelectedFolderPath.startsWith('/')) {
      relSelectedFolderPath = relSelectedFolderPath.substring(1);
    }

    let allMedia: MediaInfo[] = [];

    if (relSelectedFolderPath) {
      const files = await workspace.findFiles(join(relSelectedFolderPath, '/*'));
      const media = await MediaHelpers.updateMediaData(MediaHelpers.filterMedia(files));

      allMedia = [...media];
    } else {
      if (staticFolder) {
        const folderSearch = join(staticFolder || "", '/*');
        const files = await workspace.findFiles(folderSearch);
        const media = await MediaHelpers.updateMediaData(MediaHelpers.filterMedia(files));

        allMedia = [...media];
      }

      if (pageBundleContentTypes.length > 0) {
        if (contentFolders && wsFolder) {
          for (let i = 0; i < contentFolders.length; i++) {
            const contentFolder = contentFolders[i];
            const relFolderPath = contentFolder.path.substring(wsFolder.fsPath.length + 1);
            const folderSearch = relSelectedFolderPath ? join(relSelectedFolderPath, '/*') : join(relFolderPath, '/*');
            const files = await workspace.findFiles(folderSearch);
            const media = await MediaHelpers.updateMediaData(MediaHelpers.filterMedia(files));
      
            allMedia = [...allMedia, ...media];
          }
        }
      }
    }

    MediaHelpers.media = Object.assign([], allMedia);
    let files: MediaInfo[] = MediaHelpers.media;

    // Retrieve the total after filtering and before the slicing happens
    const total = files.length;

    // Get media set
    files = files.map((file) => {
      try {
        const metadata = MediaLibrary.getInstance().get(file.fsPath);

        return {
          ...file,
          dimensions: imageSize(file.fsPath),
          ...metadata
        };
      } catch (e) {
        return {...file};
      }
    });
    files = files.filter(f => f.mtime !== undefined);

    // Sort the files
    if (crntSort?.type === SortType.string) {
      if (crntSort.id === SortOption.AltAsc || crntSort.id === SortOption.AltDesc) {
        files = files.sort(Sorting.alphabetically("alt"));
      } else if (crntSort.id === SortOption.CaptionAsc || crntSort.id === SortOption.CaptionDesc) {
        files = files.sort(Sorting.alphabetically("caption"));
      } else {
        files = files.sort(Sorting.alphabetically("fsPath"));
      }
    } else if (crntSort?.type === SortType.number && (crntSort?.id === SortOption.SizeAsc || crntSort?.id === SortOption.SizeDesc)) {
      files = files.sort(Sorting.numerically("size"));
    } else if (crntSort?.type === SortType.date) {
      files = files.sort(Sorting.dateWithFallback("mtime", "fsPath"));
    } else {
      files = files.sort(Sorting.alphabetically("fsPath"));
    }

    if (crntSort?.order === SortOrder.desc) {
      files = files.reverse();
    }

    // Retrieve all the folders
    let allContentFolders: string[] = [];
    let allFolders: string[] = [];

    if (selectedFolder) {
      if (existsSync(selectedFolder)) {
        allFolders = readdirSync(selectedFolder, { withFileTypes: true }).filter(dir => dir.isDirectory()).map(dir => parseWinPath(join(selectedFolder, dir.name)));
      }
    } else {
      if (pageBundleContentTypes.length > 0) {
        for (const contentFolder of contentFolders) {
          const contentPath = contentFolder.path;
          if (contentPath && existsSync(contentPath)) {
            const subFolders = readdirSync(contentPath, { withFileTypes: true }).filter(dir => dir.isDirectory()).map(dir => parseWinPath(join(contentPath, dir.name)));
            allContentFolders = [...allContentFolders, ...subFolders];
          }
        }
      }
  
      const staticPath = join(parseWinPath(wsFolder?.fsPath || ""), staticFolder || "");
      if (staticPath && existsSync(staticPath)) {
        allFolders = readdirSync(staticPath, { withFileTypes: true }).filter(dir => dir.isDirectory()).map(dir => parseWinPath(join(staticPath, dir.name)));
      }
    }

    // Store the last opened folder
    await Extension.getInstance().setState(ExtensionState.SelectedFolder, requestedFolder === HOME_PAGE_NAVIGATION_ID ? HOME_PAGE_NAVIGATION_ID : selectedFolder, "workspace");
    
    let sortedFolders = [...allContentFolders, ...allFolders];
    sortedFolders = sortedFolders.sort((a, b) => {
      if (a.toLowerCase() < b.toLowerCase()) {
        return -1;
      }
      if (a.toLowerCase() > b.toLowerCase()) {
        return 1;
      }
      return 0;
    });

    if (crntSort?.order === SortOrder.desc) {
      sortedFolders = sortedFolders.reverse();
    }

    return {
      media: files,
      total: total,
      folders: sortedFolders,
      selectedFolder
    } as MediaPaths
  }

  /**
   * Reset media array
   */
  public static resetMedia() {
    MediaHelpers.media = [];
  }

  /**
   * Save the dropped file in the current folder
   * @param fileData 
   */
   public static async saveFile({fileName, contents, folder}: { fileName: string; contents: string; folder: string | null }) {
    if (fileName && contents) {
      const wsFolder = Folders.getWorkspaceFolder();
      const staticFolder = Settings.get<string>(SETTING_CONTENT_STATIC_FOLDER);
      const wsPath = wsFolder ? wsFolder.fsPath : "";
      let absFolderPath = join(wsPath, staticFolder || "");

      if (folder) {
        absFolderPath = folder;
      }

      if (!existsSync(absFolderPath)) {
        absFolderPath = join(wsPath, folder || "");
      }

      if (!existsSync(absFolderPath)) {
        Notifications.error(`We couldn't find your selected folder.`);
        return;
      }

      const staticPath = join(absFolderPath, fileName);
      const imgData = decodeBase64Image(contents);

      if (imgData) {
        writeFileSync(staticPath, imgData.data);
        Notifications.info(`File ${fileName} uploaded to: ${folder}`);
        
        return true;
      } else {
        Notifications.error(`Something went wrong uploading ${fileName}`);
        throw new Error(`Something went wrong uploading ${fileName}`);
      }
    }

    return false;
  }

  /**
   * Delete the selected file
   * @param data 
   * @returns 
   */
  public static async deleteFile({ file, page, folder }: { file: string; page: number; folder: string | null; }) {
    if (!file) {
      return;
    }

    try {
      unlinkSync(file);

      MediaHelpers.media = [];
      return true;
    } catch(err: any) {
      Notifications.error(`Something went wrong deleting ${basename(file)}`);
      throw new Error(`Something went wrong deleting ${basename(file)}`);
    }
  }

  /**
   * Insert an image into the front matter or contents
   * @param data 
   */
  public static async insertMediaToMarkdown(data: any) {
    if (data?.file && data?.image) {
      if (!data?.position) {
        await commands.executeCommand(`workbench.view.extension.frontmatter-explorer`);
      }

      await EditorHelper.showFile(data.file);
      Dashboard.resetViewData();

      const editor = window.activeTextEditor;
      const wsFolder = Folders.getWorkspaceFolder();
      const filePath = data.file;
      let imgPath = data.image;

      const article = editor ? ArticleHelper.getFrontMatter(editor) : null;
      const articleCt = article && article.data ? ArticleHelper.getContentType(article.data) : DEFAULT_CONTENT_TYPE;

      const absImgPath = join(parseWinPath(wsFolder?.fsPath || ""), imgPath);
      const fileDir = parseWinPath(dirname(filePath));
      const imgDir = parseWinPath(dirname(absImgPath));

      // Check if relative paths need to be created for the media files
      if (articleCt.pageBundle) {
        if (imgDir.toLowerCase().indexOf(fileDir.toLowerCase()) !== -1) {
          const relImgPath = relative(fileDir, imgDir);

          imgPath = join(relImgPath, basename(imgPath));

          if (!imgPath.startsWith("/")) {
            imgPath = `./${imgPath}`;
          }

          // Snippets are already parsed, so update the URL of the image
          if (data.snippet) {
            data.snippet = data.snippet.replace(data.image, imgPath);
          }
        }
      }

      // Check if the image needs to be inserted in the content or front matter of the article
      if (data?.position) {
        const line = data.position.line;
        const character = data.position.character;
        if (line) {
          const selection = editor?.selection;
          await editor?.edit(builder => {
            const snippet = data.snippet || `![${data.alt || data.caption || ""}](${imgPath})`;
            if (selection !== undefined) {
              builder.replace(selection, snippet);
            } else {
              builder.insert(new Position(line, character), snippet);
            }            
          });
        }
        MediaListener.getMediaSelection();
      } else {
        MediaListener.getMediaSelection();
        
        DataListener.updateMetadata({
          field: data.fieldName, 
          value: imgPath, 
          parents: data.parents,
          blockData: data.blockData
        });
      }
    }
  }

  /**
   * Update the metadata of a media file
   * @param data 
   */
  public static updateMetadata(data: any) {
    const { file, filename, page, folder, ...metadata }: { file:string; filename:string; page: number; folder: string | null; metadata: any; } = data;
    
    const mediaLib = MediaLibrary.getInstance();
    mediaLib.set(file, metadata);

    // Check if filename needs to be updated
    mediaLib.updateFilename(file, filename);
  }

  /**
   * Filter the media files
   */
  private static filterMedia(files: Uri[]) {
    return files.filter(file => {
      const ext = extname(file.fsPath);
      return ['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext.toLowerCase());
    }).map((file) => ({
      filename: basename(file.fsPath),
      fsPath: file.fsPath,
      vsPath: Dashboard.getWebview()?.asWebviewUri(file).toString(),
      stats: undefined
    } as MediaInfo));
  }

  /**
   * Update the metadata of the retrieved files
   * @param files 
   */
  private static async updateMediaData(files: MediaInfo[]) {
    files = files.map((m: MediaInfo) => {
      const stats = statSync(m.fsPath);
      return Object.assign({}, m, stats);
    });

    return Object.assign([], files);
  }
}