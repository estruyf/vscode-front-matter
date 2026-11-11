import {
  CancellationToken,
  DataTransfer,
  DataTransferFile,
  DocumentDropOrPasteEditKind,
  DocumentPasteEdit,
  DocumentPasteEditContext,
  DocumentPasteEditProvider,
  DocumentPasteProviderMetadata,
  DocumentSelector,
  Disposable,
  Range,
  TextDocument,
  commands,
  languages
} from 'vscode';
import { basename, dirname, join, parse, relative } from 'path';
import { extension } from 'mime-types';
import * as l10n from '@vscode/l10n';
import { Folders } from '../commands/Folders';
import { Wysiwyg } from '../commands/Wysiwyg';
import {
  COMMAND_NAME,
  DEFAULT_CONTENT_TYPE,
  SETTING_CONTENT_SUPPORTED_FILETYPES,
  SETTING_MEDIA_PASTE_BEHAVIOR,
  SETTING_MEDIA_PASTE_FILENAME,
  SETTING_MEDIA_PASTE_FOLDER
} from '../constants';
import { STATIC_FOLDER_PLACEHOLDER } from '../constants/StaticFolderPlaceholder';
import { ArticleHelper } from '../helpers/ArticleHelper';
import { FrameworkDetector } from '../helpers/FrameworkDetector';
import { Logger } from '../helpers/Logger';
import { MediaHelpers } from '../helpers/MediaHelpers';
import { Notifications } from '../helpers/Notifications';
import { Settings } from '../helpers/SettingsHelper';
import { parseWinPath } from '../helpers/parseWinPath';
import { LocalizationKey } from '../localization';
import { DashboardData } from '../models';

type PasteBehavior = 'dashboard' | 'auto' | 'disabled';

interface PasteContext {
  document: TextDocument;
  range: Range;
  fileName: string;
  mimeType: string;
  contents: Uint8Array;
}

/**
 * Paste edit which carries the media contents over to the resolve step
 */
class MediaPasteEdit extends DocumentPasteEdit {
  constructor(title: string, kind: DocumentDropOrPasteEditKind, public ctx: PasteContext) {
    super('', title, kind);
  }
}

export class MediaPasteProvider implements DocumentPasteEditProvider<MediaPasteEdit> {
  public static readonly kind = DocumentDropOrPasteEditKind.Empty.append('image', 'frontMatter');

  public static register(subscriptions: Disposable[]) {
    const supportedFiles = Settings.get<string[]>(SETTING_CONTENT_SUPPORTED_FILETYPES);

    const selectors: DocumentSelector[] = [{ language: 'markdown', scheme: 'file' }];
    for (const fileExt of supportedFiles || []) {
      if (fileExt !== 'md' && fileExt !== 'markdown') {
        selectors.push({ pattern: `**/*.${fileExt}`, scheme: 'file' });
      }
    }

    const provider = new MediaPasteProvider();
    const metadata: DocumentPasteProviderMetadata = {
      providedPasteEditKinds: [MediaPasteProvider.kind],
      pasteMimeTypes: ['files', 'image/*']
    };

    for (const selector of selectors) {
      subscriptions.push(languages.registerDocumentPasteEditProvider(selector, provider, metadata));
    }
  }

  public async provideDocumentPasteEdits(
    document: TextDocument,
    ranges: readonly Range[],
    dataTransfer: DataTransfer,
    _context: DocumentPasteEditContext,
    token: CancellationToken
  ): Promise<MediaPasteEdit[] | undefined> {
    if (MediaPasteProvider.getBehavior() === 'disabled') {
      return;
    }

    if (!ArticleHelper.isSupportedFile(document)) {
      return;
    }

    const image = MediaPasteProvider.getImageFile(dataTransfer);
    if (!image) {
      return;
    }

    // Read the contents while the data transfer is still valid
    const contents = await image.file.data();
    if (token.isCancellationRequested || !contents?.length) {
      return;
    }

    const edit = new MediaPasteEdit(
      l10n.t(LocalizationKey.providersMediaPasteTitle),
      MediaPasteProvider.kind,
      {
        document,
        range: ranges[0],
        fileName: MediaPasteProvider.getFileName(image.file, image.mimeType, document),
        mimeType: image.mimeType,
        contents
      }
    );

    return [edit];
  }

  public async resolveDocumentPasteEdit(
    pasteEdit: MediaPasteEdit,
    token: CancellationToken
  ): Promise<MediaPasteEdit> {
    const { document, range, fileName, mimeType, contents } = pasteEdit.ctx;

    const article = ArticleHelper.getFrontMatterFromDocument(document);
    const contentType = article?.data
      ? await ArticleHelper.getContentType(article)
      : DEFAULT_CONTENT_TYPE;
    const isPageBundle = !!contentType?.pageBundle;

    const folder = MediaPasteProvider.getTargetFolder(document.fileName, isPageBundle);

    if (token.isCancellationRequested) {
      return pasteEdit;
    }

    if (MediaPasteProvider.getBehavior() === 'dashboard') {
      // The dashboard takes over: it stores the file, collects the metadata, and
      // inserts the markup itself through `MediaHelpers.insertMediaToMarkdown`.
      await commands.executeCommand(COMMAND_NAME.dashboard, {
        type: 'media',
        data: {
          type: 'media',
          pageBundle: isPageBundle,
          filePath: document.fileName,
          fieldName: basename(document.fileName),
          position: range.start,
          selection: document.getText(range),
          suggestedFolder: folder,
          pendingUpload: {
            fileName,
            contents: `data:${mimeType};base64,${Buffer.from(contents).toString('base64')}`
          }
        }
      } as DashboardData);

      return pasteEdit;
    }

    let absMediaPath: string | undefined;
    try {
      absMediaPath = await MediaHelpers.saveMediaBuffer(fileName, contents, folder);
    } catch (e) {
      Logger.error(`MediaPasteProvider: ${(e as Error)?.message}`);
    }

    if (!absMediaPath) {
      Notifications.error(l10n.t(LocalizationKey.providersMediaPasteSaveFailed, folder));
      return pasteEdit;
    }

    const relPath = MediaPasteProvider.getRelPath(absMediaPath, document.fileName, isPageBundle);
    pasteEdit.insertText = MediaPasteProvider.getMarkup(relPath, document.fileName);

    return pasteEdit;
  }

  private static getBehavior(): PasteBehavior {
    return Settings.get<PasteBehavior>(SETTING_MEDIA_PASTE_BEHAVIOR) || 'dashboard';
  }

  /**
   * Retrieve the first image from the data transfer
   */
  private static getImageFile(
    dataTransfer: DataTransfer
  ): { file: DataTransferFile; mimeType: string } | undefined {
    let image: { file: DataTransferFile; mimeType: string } | undefined;

    dataTransfer.forEach((item, mimeType) => {
      if (image || !mimeType.startsWith('image/')) {
        return;
      }

      const file = item.asFile();
      if (file) {
        image = { file, mimeType };
      }
    });

    return image;
  }

  /**
   * Determine the file name to use for the pasted media. Images pasted from the
   * clipboard have no name of their own, so the configured template is used.
   */
  private static getFileName(
    file: DataTransferFile,
    mimeType: string,
    document: TextDocument
  ): string {
    const { name, ext } = parse(file.name || '');
    if (name && ext) {
      return `${name}${ext}`;
    }

    const template = Settings.get<string>(SETTING_MEDIA_PASTE_FILENAME) || 'image-{date}-{time}';
    const now = new Date();
    const pad = (value: number) => `${value}`.padStart(2, '0');

    const fileName = template
      .replace(/{filename}/g, parse(document.fileName).name)
      .replace(/{date}/g, `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`)
      .replace(/{time}/g, `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`);

    const fileExt = ext || `.${extension(mimeType) || 'png'}`;

    return `${fileName}${fileExt}`;
  }

  /**
   * Determine where the pasted media needs to be stored
   */
  private static getTargetFolder(filePath: string, isPageBundle: boolean): string {
    const pasteFolder = Settings.get<string>(SETTING_MEDIA_PASTE_FOLDER);
    if (pasteFolder) {
      return Folders.getAbsFilePath(pasteFolder);
    }

    const staticFolder = Folders.getStaticFolderRelativePath();

    // Hexo stores its assets next to the post, in a folder named after the post
    if (staticFolder === STATIC_FOLDER_PLACEHOLDER.hexo.placeholder) {
      return parseWinPath(join(dirname(filePath), parse(filePath).name));
    }

    // Page bundles keep their media in the folder of the page itself
    if (isPageBundle) {
      return parseWinPath(dirname(filePath));
    }

    const wsFolder = Folders.getWorkspaceFolder();
    return parseWinPath(
      join(wsFolder?.fsPath || '', !staticFolder || staticFolder === '/' ? '' : staticFolder)
    );
  }

  /**
   * Determine the path to reference the media by, taking the static folder and
   * the framework of the project into account.
   */
  private static getRelPath(
    absMediaPath: string,
    filePath: string,
    isPageBundle: boolean
  ): string {
    if (isPageBundle) {
      const relDir = parseWinPath(relative(dirname(filePath), dirname(absMediaPath)));
      return parseWinPath(join(relDir, basename(absMediaPath)));
    }

    const wsFolder = Folders.getWorkspaceFolder();
    const staticFolder = Folders.getStaticFolderRelativePath();

    let relPath =
      parseWinPath(absMediaPath).split(parseWinPath(wsFolder?.fsPath || '')).pop() || '';

    if (staticFolder && staticFolder !== '/') {
      // Only strip the static folder when it is the leading path segment
      const staticFolderParsed = `/${parseWinPath(staticFolder).replace(/^\.?\/+|\/+$/g, '')}`;
      if (relPath.startsWith(`${staticFolderParsed}/`)) {
        relPath = relPath.substring(staticFolderParsed.length);
      }
    }

    return FrameworkDetector.relAssetPathUpdate(relPath, filePath);
  }

  /**
   * Create the markup to insert for the pasted media
   */
  private static getMarkup(relPath: string, filePath: string): string {
    const mediaPath = relPath.replace(/ /g, '%20');

    return Wysiwyg.getDocType(filePath) === 'asciidoc'
      ? `image:${mediaPath}[]`
      : `![](${mediaPath})`;
  }
}
