import { Messenger } from '@estruyf/vscode/dist/client';
import {
  CodeBracketIcon,
  DocumentIcon,
  MusicalNoteIcon,
  PhotoIcon,
  PlusIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { basename } from 'path';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { parseWinPath } from '../../../helpers/parseWinPath';
import { SnippetParser } from '../../../helpers/SnippetParser';
import { MediaInfo } from '../../../models/MediaPaths';
import { DashboardMessage } from '../../DashboardMessage';
import {
  LightboxAtom,
  SelectedItemActionAtom,
  SelectedMediaFolderSelector,
  SettingsSelector,
  ViewDataSelector
} from '../../state';
import { Alert } from '../Modals/Alert';
import { InfoDialog } from '../Modals/InfoDialog';
import { MediaSnippetForm } from './MediaSnippetForm';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { ItemMenu } from './ItemMenu';
import { getRelPath } from '../../utils';
import { Snippet } from '../../../models';
import useMediaInfo from '../../hooks/useMediaInfo';
import { ItemSelection } from '../Common/ItemSelection';
import { FooterActions } from './FooterActions';

export interface IItemProps {
  media: MediaInfo;
}

export const Item: React.FunctionComponent<IItemProps> = ({
  media,
}: React.PropsWithChildren<IItemProps>) => {
  const [, setLightbox] = useRecoilState(LightboxAtom);
  const [, setSelectedItemAction] = useRecoilState(SelectedItemActionAtom);
  const [showAlert, setShowAlert] = useState(false);
  const [showSnippetSelection, setShowSnippetSelection] = useState(false);
  const [snippet, setSnippet] = useState<Snippet | undefined>(undefined);
  const [showSnippetFormDialog, setShowSnippetFormDialog] = useState(false);
  const [mediaData, setMediaData] = useState<any | undefined>(undefined);
  const [filename, setFilename] = useState<string | null>(null);
  const settings = useRecoilValue(SettingsSelector);
  const selectedFolder = useRecoilValue(SelectedMediaFolderSelector);
  const viewData = useRecoilValue(ViewDataSelector);
  const { mediaFolder, mediaDetails, isAudio, isImage, isVideo } = useMediaInfo(media);

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

  const openLightbox = useCallback(() => {
    if (isImage) {
      setLightbox(media.vsPath || '');
    }
  }, [media.vsPath]);

  const renderMediaIcon = useMemo(() => {
    const path = media.fsPath;
    const extension = path.split('.').pop();

    const colors = `text-[var(--vscode-sideBarTitle-foreground)] opacity-80`;

    let icon = <DocumentIcon className={`h-4/6 ${colors}`} />;

    if (media.vsPath) {
      return null;
    }

    if (isImage) {
      return <PhotoIcon className={`h-1/2 ${colors}`} />;
    }

    if (isVideo) {
      icon = <VideoCameraIcon className={`h-4/6 ${colors}`} />;
    }

    if (isAudio) {
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
  }, [media, isImage, isVideo, isAudio]);

  const renderMedia = useMemo(() => {
    if (isAudio) {
      return null;
    }

    if (isVideo) {
      return <video src={media.vsPath} className="mx-auto object-cover" controls muted />;
    }

    if (isImage) {
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
      <li className={`group flex flex-col relative shadow-md hover:shadow-xl dark:shadow-none border rounded bg-[var(--vscode-sideBar-background)] hover:bg-[var(--vscode-list-hoverBackground)] text-[var(--vscode-sideBarTitle-foreground)] border-[var(--frontmatter-border)]`}>
        <button
          className={`group/button relative block w-full aspect-w-10 aspect-h-7 overflow-hidden h-48 ${isImage ? 'cursor-pointer' : 'cursor-default'} border-b border-[var(--frontmatter-border)]`}
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

          <ItemSelection filePath={media.fsPath} />

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

              <ItemSelection filePath={media.fsPath} />
            </div>
          )}
        </button>

        <div className={`relative py-4 pl-4 pr-12 grow`}>
          <ItemMenu
            media={media}
            relPath={relPath}
            selectedFolder={selectedFolder}
            viewData={viewData?.data}
            snippets={mediaSnippets}
            scripts={settings?.scripts}
            insertIntoArticle={insertIntoArticle}
            showUpdateMedia={() => setSelectedItemAction({
              path: media.fsPath,
              action: 'edit'
            })}
            showMediaDetails={() => setSelectedItemAction({
              path: media.fsPath,
              action: 'view'
            })}
            processSnippet={processSnippet}
            onDelete={() => setShowAlert(true)} />

          <p className={`text-sm font-bold pointer-events-none flex items-center break-all text-[var(--vscode-foreground)]}`}>
            {basename(parseWinPath(media.fsPath) || '')}
          </p>
          {!isImage && media.metadata.title && (
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
                {mediaDetails}
              </span>
            </p>
          )}
        </div>

        <FooterActions
          media={media}
          relPath={relPath}
          snippets={mediaSnippets}
          viewData={viewData?.data}
          insertIntoArticle={insertIntoArticle}
          insertSnippet={insertSnippet}
          onDelete={() => setShowAlert(true)} />
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

      {showAlert && (
        <Alert
          title={`${l10n.t(LocalizationKey.commonDelete)}: ${basename(parseWinPath(media.fsPath) || '')}`}
          description={l10n.t(LocalizationKey.dashboardMediaItemAlertDeleteDescription, mediaFolder)}
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
