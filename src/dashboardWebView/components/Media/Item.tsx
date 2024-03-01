import { Messenger } from '@estruyf/vscode/dist/client';
import {
  CodeBracketIcon,
  DocumentIcon,
  MusicalNoteIcon,
  PhotoIcon,
  PlusIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { basename, dirname } from 'path';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { parseWinPath } from '../../../helpers/parseWinPath';
import { SnippetParser } from '../../../helpers/SnippetParser';
import { MediaInfo } from '../../../models/MediaPaths';
import { DashboardMessage } from '../../DashboardMessage';
import {
  LightboxAtom,
  SelectedMediaFolderSelector,
  SettingsSelector,
  ViewDataSelector
} from '../../state';
import { Alert } from '../Modals/Alert';
import { InfoDialog } from '../Modals/InfoDialog';
import { DetailsSlideOver } from './DetailsSlideOver';
import { MediaSnippetForm } from './MediaSnippetForm';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { ItemMenu } from './ItemMenu';
import { getRelPath } from '../../utils';
import { Snippet } from '../../../models';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';

export interface IItemProps {
  media: MediaInfo;
}

export const Item: React.FunctionComponent<IItemProps> = ({
  media,
}: React.PropsWithChildren<IItemProps>) => {
  const [, setLightbox] = useRecoilState(LightboxAtom);
  const [showAlert, setShowAlert] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSnippetSelection, setShowSnippetSelection] = useState(false);
  const [snippet, setSnippet] = useState<Snippet | undefined>(undefined);
  const [showDetails, setShowDetails] = useState(false);
  const [showSnippetFormDialog, setShowSnippetFormDialog] = useState(false);
  const [mediaData, setMediaData] = useState<any | undefined>(undefined);
  const [filename, setFilename] = useState<string | null>(null);
  const settings = useRecoilValue(SettingsSelector);
  const selectedFolder = useRecoilValue(SelectedMediaFolderSelector);
  const viewData = useRecoilValue(ViewDataSelector);

  const relPath = useMemo(() => {
    return getRelPath(media.fsPath, settings?.staticFolder, settings?.wsFolder);
  }, [media.fsPath, settings?.staticFolder, settings?.wsFolder]);

  const hasViewData = useMemo(() => {
    return viewData?.data?.filePath !== undefined;
  }, [viewData]);

  const mediaSnippets = useMemo(() => {
    if (!settings?.snippets) {
      return [];
    }

    const keys = Object.keys(settings.snippets);
    return keys
      .filter((key) => (settings.snippets || {})[key].isMediaSnippet)
      .map((key) => ({ title: key, ...(settings.snippets || {})[key] }));
  }, [settings]);

  const showMediaSnippet = useMemo(() => {
    return viewData?.data?.position && mediaSnippets.length > 0;
  }, [viewData, mediaSnippets]);

  const getFolder = () => {
    if (settings?.wsFolder && media.fsPath) {
      let relPath = media.fsPath.split(settings.wsFolder).pop();

      if (settings.staticFolder && relPath) {
        relPath = relPath.split(settings.staticFolder).pop();
      }

      return dirname(parseWinPath(relPath) || '');
    }
    return '';
  };

  const getFileName = () => {
    return basename(parseWinPath(media.fsPath) || '');
  };

  const insertIntoArticle = useCallback(() => {
    if (viewData?.data?.type === 'file') {
      Messenger.send(DashboardMessage.insertFile, {
        relPath: parseWinPath(relPath) || '',
        file: viewData?.data?.filePath,
        fieldName: viewData?.data?.fieldName,
        parents: viewData?.data?.parents,
        multiple: viewData?.data?.multiple,
        value: viewData?.data?.value,
        position: viewData?.data?.position || null,
        blockData:
          typeof viewData?.data?.blockData !== 'undefined' ? viewData?.data?.blockData : undefined,
        title: media.metadata.title
      });
    } else {
      Messenger.send(DashboardMessage.insertMedia, {
        relPath: parseWinPath(relPath) || '',
        file: viewData?.data?.filePath,
        fieldName: viewData?.data?.fieldName,
        parents: viewData?.data?.parents,
        multiple: viewData?.data?.multiple,
        value: viewData?.data?.value,
        position: viewData?.data?.position || null,
        blockData:
          typeof viewData?.data?.blockData !== 'undefined' ? viewData?.data?.blockData : undefined,
        alt: media.metadata.alt || '',
        caption: media.metadata.caption || '',
        title: media.metadata.title || ''
      });
    }
  }, [media, settings, viewData, relPath]);

  const insertSnippet = useCallback(() => {
    if (mediaSnippets.length === 1) {
      processSnippet(mediaSnippets[0]);
    } else {
      // Show dialog to select
      setShowSnippetSelection(true);
    }
  }, [mediaSnippets]);

  /**
   * Process the snippet
   */
  const processSnippet = useCallback(
    (snippet: Snippet) => {
      setShowSnippetSelection(false);

      const fieldData = {
        mediaUrl: (parseWinPath(relPath) || '').replace(/ /g, '%20'),
        filename: basename(relPath || ''),
        mediaWidth: media?.dimensions?.width?.toString() || '',
        mediaHeight: media?.dimensions?.height?.toString() || '',
        ...media.metadata
      };

      if (!snippet.fields || snippet.fields.length === 0) {
        setShowSnippetFormDialog(false);
        setMediaData(undefined);

        const output = SnippetParser.render(
          snippet.body,
          fieldData,
          snippet?.openingTags,
          snippet?.closingTags
        );
        insertMediaSnippetToArticle(output);
      } else {
        setSnippet(snippet);
        setShowSnippetFormDialog(true);
        setMediaData(fieldData);
      }
    },
    [media, settings, viewData, mediaSnippets, relPath]
  );

  /**
   * Insert the media snippet
   */
  const insertMediaSnippetToArticle = useCallback(
    (output: string) => {
      Messenger.send(DashboardMessage.insertMedia, {
        relPath: parseWinPath(relPath) || '',
        file: viewData?.data?.filePath,
        fieldName: viewData?.data?.fieldName,
        position: viewData?.data?.position || null,
        snippet: output
      });
    },
    [viewData, relPath]
  );

  const confirmDeletion = () => {
    Messenger.send(DashboardMessage.deleteMedia, {
      file: media.fsPath,
      folder: selectedFolder
    });
  };

  const getDimensions = () => {
    if (media.dimensions) {
      return `${media.dimensions.width} x ${media.dimensions.height}`;
    }
    return '';
  };

  const getSize = () => {
    if (media?.size) {
      const size = media.size / (1024 * 1024);
      if (size > 1) {
        return `${size.toFixed(2)} MB`;
      } else {
        return `${(size * 1024).toFixed(2)} KB`;
      }
    }

    return '';
  };

  const getMediaDetails = () => {
    let sizeDetails = [];

    const dimensions = getDimensions();
    if (dimensions) {
      sizeDetails.push(dimensions);
    }

    const size = getSize();
    if (size) {
      sizeDetails.push(size);
    }

    return sizeDetails.join(' - ');
  };

  const openLightbox = useCallback(() => {
    if (isImageFile) {
      setLightbox(media.vsPath || '');
    }
  }, [media.vsPath]);

  const updateMetadata = () => {
    setShowForm(true);
    setShowDetails(true);
  };

  const isVideoFile = useMemo(() => {
    if (media.mimeType?.startsWith('video/')) {
      return true;
    }
    return false;
  }, [media]);

  const isAudioFile = useMemo(() => {
    if (media.mimeType?.startsWith('audio/')) {
      return true;
    }
    return false;
  }, [media]);

  const isImageFile = useMemo(() => {
    if (
      media.mimeType?.startsWith('image/') &&
      !media.mimeType?.startsWith('image/vnd.adobe.photoshop')
    ) {
      return true;
    }
    return false;
  }, [media]);

  const renderMediaIcon = useMemo(() => {
    const path = media.fsPath;
    const extension = path.split('.').pop();

    const colors = `text-[var(--vscode-sideBarTitle-foreground)] opacity-80`;

    let icon = <DocumentIcon className={`h-4/6 ${colors}`} />;

    if (media.vsPath) {
      return null;
    }

    if (isImageFile) {
      return <PhotoIcon className={`h-1/2 ${colors}`} />;
    }

    if (isVideoFile) {
      icon = <VideoCameraIcon className={`h-4/6 ${colors}`} />;
    }

    if (isAudioFile) {
      icon = <MusicalNoteIcon className={`h-4/6 ${colors}`} />;
    }

    return (
      <div className="w-full h-full flex justify-center items-center">
        {icon}
        <span className="text-2xl font-bold absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center">
          {extension}
        </span>
      </div>
    );
  }, [media, isImageFile, isVideoFile, isAudioFile]);

  const renderMedia = useMemo(() => {
    if (isAudioFile) {
      return null;
    }

    if (isVideoFile) {
      return <video src={media.vsPath} className="mx-auto object-cover" controls muted />;
    }

    if (isImageFile) {
      return (
        <img src={media.vsPath} alt={basename(media.fsPath)} className="mx-auto object-cover" />
      );
    }

    return null;
  }, [media]);

  const clearFormData = () => {
    setShowSnippetFormDialog(false);
    setSnippet(undefined);
    setMediaData(undefined);
  };

  useEffect(() => {
    const name = basename(parseWinPath(media.fsPath) || '');
    if (name !== filename) {
      setFilename(getFileName());
    }
  }, [media.fsPath]);

  useEffect(() => {
    if (!hasViewData) {
      clearFormData();
    }
  }, [viewData, hasViewData]);

  return (
    <>
      <li className={`group relative shadow-md hover:shadow-xl dark:shadow-none border rounded bg-[var(--vscode-sideBar-background)] hover:bg-[var(--vscode-list-hoverBackground)] text-[var(--vscode-sideBarTitle-foreground)] border-[var(--frontmatter-border)]`}>
        <button
          className={`group/button relative block w-full aspect-w-10 aspect-h-7 overflow-hidden h-48 ${isImageFile ? 'cursor-pointer' : 'cursor-default'} border-b border-[var(--frontmatter-border)]`}
          onClick={hasViewData ? undefined : openLightbox}
        >
          <div
            className={`absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center`}
          >
            {renderMediaIcon}
          </div>
          <div
            className={`absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center group-hover:brightness-75`}
          >
            {renderMedia}
          </div>

          <div className='hidden group-hover:block absolute top-2 left-2 white'>
            <VSCodeCheckbox
              onClick={(e: any) => {
                e.stopPropagation();
              }} />
          </div>

          {hasViewData && (
            <div
              className={`hidden group-hover/button:flex absolute top-0 right-0 bottom-0 left-0 items-center justify-center bg-black bg-opacity-70`}
            >
              <div
                className={`h-full ${showMediaSnippet ? 'w-1/3' : 'w-full'
                  } flex items-center justify-center`}
              >
                <button
                  title={l10n.t(LocalizationKey.dashboardMediaItemButtomInsertImage)}
                  className={`h-1/3 text-white hover:text-[var(--vscode-button-background)]`}
                  onClick={insertIntoArticle}
                >
                  <PlusIcon className={`w-full h-full hover:drop-shadow-md `} aria-hidden="true" />
                </button>
              </div>
              {viewData?.data?.position && mediaSnippets.length > 0 && (
                <div className={`h-full w-1/3 flex items-center justify-center`}>
                  <button
                    title={l10n.t(LocalizationKey.dashboardMediaItemButtomInsertSnippet)}
                    className={`h-1/3 text-white hover:text-[var(--vscode-button-background)]`}
                    onClick={insertSnippet}
                  >
                    <CodeBracketIcon
                      className={`w-full h-full hover:drop-shadow-md `}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              )}
            </div>
          )}
        </button>
        <div className={`relative py-4 pl-4 pr-12`}>
          <ItemMenu
            media={media}
            relPath={relPath}
            selectedFolder={selectedFolder}
            viewData={viewData?.data}
            snippets={mediaSnippets}
            scripts={settings?.scripts}
            insertIntoArticle={insertIntoArticle}
            insertSnippet={insertSnippet}
            showUpdateMedia={updateMetadata}
            showMediaDetails={() => setShowDetails(true)}
            processSnippet={processSnippet}
            onDelete={() => setShowAlert(true)} />

          <p className={`text-sm font-bold pointer-events-none flex items-center break-all text-[var(--vscode-foreground)]}`}>
            {basename(parseWinPath(media.fsPath) || '')}
          </p>
          {!isImageFile && media.metadata.title && (
            <p className={`mt-2 text-xs font-medium pointer-events-none flex flex-col items-start`}>
              <b className={`mr-2`}>
                {l10n.t(LocalizationKey.dashboardMediaCommonTitle)}:
              </b>
              <span className={`block mt-1 text-xs text-[var(--vscode-foreground)]`}>{media.metadata.title}</span>
            </p>
          )}
          {media.metadata.caption && (
            <p className={`mt-2 text-xs font-medium pointer-events-none flex flex-col items-start`}>
              <b className={`mr-2`}>
                {l10n.t(LocalizationKey.dashboardMediaCommonCaption)}:
              </b>
              <span className={`block mt-1 text-xs text-[var(--vscode-foreground)]`}>{media.metadata.caption}</span>
            </p>
          )}
          {!media.metadata.caption && media.metadata.alt && (
            <p className={`mt-2 text-xs font-medium pointer-events-none  flex flex-col items-start`}>
              <b className={`mr-2`}>
                {l10n.t(LocalizationKey.dashboardMediaCommonAlt)}:
              </b>
              <span className={`block mt-1 text-xs text-[var(--vscode-foreground)]`}>{media.metadata.alt}</span>
            </p>
          )}
          {(media?.size || media?.dimensions) && (
            <p className={`mt-2 text-xs font-medium pointer-events-none flex flex-col items-start`}>
              <b className={`mr-1`}>
                {l10n.t(LocalizationKey.dashboardMediaCommonSize)}:
              </b>
              <span className={`block mt-1 text-xs text-[var(--vscode-foreground)]`}>
                {getMediaDetails()}
              </span>
            </p>
          )}
        </div>
      </li>

      {showSnippetSelection && (
        <InfoDialog
          icon={<CodeBracketIcon className="h-6 w-6" aria-hidden="true" />}
          title={l10n.t(LocalizationKey.commonInsertSnippet)}
          description={l10n.t(LocalizationKey.dashboardMediaItemInfoDialogSnippetDescription)}
          dismiss={() => setShowSnippetSelection(false)}
        >
          <ul className="flex justify-center">
            {mediaSnippets.map((snippet, idx) => (
              <li key={idx} className="inline-flex items-center pb-2 mr-2">
                <button
                  className={`w-full inline-flex justify-center border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:w-auto sm:text-sm disabled:opacity-30 bg-[var(--frontmatter-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)]`}
                  onClick={() => processSnippet(snippet)}
                >
                  {snippet.title}
                </button>
              </li>
            ))}
          </ul>
        </InfoDialog>
      )}

      {showDetails && (
        <DetailsSlideOver
          imgSrc={media.vsPath || ''}
          size={getSize()}
          dimensions={getDimensions()}
          folder={getFolder()}
          media={media}
          showForm={showForm}
          isImageFile={isImageFile}
          isVideoFile={isVideoFile}
          onEdit={() => setShowForm(true)}
          onEditClose={() => setShowForm(false)}
          onDismiss={() => {
            setShowDetails(false);
            setShowForm(false);
          }}
        />
      )}

      {showAlert && (
        <Alert
          title={`${l10n.t(LocalizationKey.commonDelete)}: ${basename(parseWinPath(media.fsPath) || '')}`}
          description={l10n.t(LocalizationKey.dashboardMediaItemAlertDeleteDescription, getFolder())}
          okBtnText={l10n.t(LocalizationKey.commonDelete)}
          cancelBtnText={l10n.t(LocalizationKey.commonCancel)}
          dismiss={() => setShowAlert(false)}
          trigger={confirmDeletion}
        />
      )}

      {showSnippetFormDialog && snippet && mediaData && (
        <MediaSnippetForm
          media={media}
          mediaData={mediaData}
          snippet={snippet}
          onDismiss={clearFormData}
          onInsert={insertMediaSnippetToArticle}
        />
      )}
    </>
  );
};
