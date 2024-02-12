import { Messenger } from '@estruyf/vscode/dist/client';
import { Menu } from '@headlessui/react';
import {
  ClipboardIcon,
  CodeBracketIcon,
  DocumentIcon,
  EyeIcon,
  MusicalNoteIcon,
  PencilIcon,
  PhotoIcon,
  PlusIcon,
  CommandLineIcon,
  TrashIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { basename, dirname } from 'path';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { CustomScript } from '../../../helpers/CustomScript';
import { parseWinPath } from '../../../helpers/parseWinPath';
import { SnippetParser } from '../../../helpers/SnippetParser';
import { ScriptType, Snippet } from '../../../models';
import { MediaInfo } from '../../../models/MediaPaths';
import { DashboardMessage } from '../../DashboardMessage';
import {
  LightboxAtom,
  SelectedMediaFolderSelector,
  SettingsSelector,
  ViewDataSelector
} from '../../state';
import { MenuItem, MenuItems } from '../Menu';
import { ActionMenuButton } from '../Menu/ActionMenuButton';
import { QuickAction } from '../Menu/QuickAction';
import { Alert } from '../Modals/Alert';
import { InfoDialog } from '../Modals/InfoDialog';
import { DetailsSlideOver } from './DetailsSlideOver';
import { usePopper } from 'react-popper';
import { MediaSnippetForm } from './MediaSnippetForm';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IItemProps {
  media: MediaInfo;
  index: number;
}

export const Item: React.FunctionComponent<IItemProps> = ({
  media,
  index
}: React.PropsWithChildren<IItemProps>) => {
  const [, setLightbox] = useRecoilState(LightboxAtom);
  const [showAlert, setShowAlert] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSnippetSelection, setShowSnippetSelection] = useState(false);
  const [snippet, setSnippet] = useState<Snippet | undefined>(undefined);
  const [showDetails, setShowDetails] = useState(false);
  const [showSnippetFormDialog, setShowSnippetFormDialog] = useState(false);
  const [mediaData, setMediaData] = useState<any | undefined>(undefined);
  const [caption, setCaption] = useState(media.caption);
  const [alt, setAlt] = useState(media.alt);
  const [filename, setFilename] = useState<string | null>(null);
  const settings = useRecoilValue(SettingsSelector);
  const selectedFolder = useRecoilValue(SelectedMediaFolderSelector);
  const viewData = useRecoilValue(ViewDataSelector);

  const hasViewData = useMemo(() => {
    return viewData?.data?.filePath !== undefined;
  }, [viewData]);

  const [referenceElement, setReferenceElement] = useState<any>(null);
  const [popperElement, setPopperElement] = useState<any>(null);
  const { styles, attributes, update } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-end',
    strategy: 'fixed'
  });

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

  const getRelPath = () => {
    let relPath: string | undefined = '';
    if (settings?.wsFolder && media.fsPath) {
      const wsFolderParsed = parseWinPath(settings.wsFolder);
      const mediaParsed = parseWinPath(media.fsPath);

      relPath = mediaParsed.split(wsFolderParsed).pop();

      // If the static folder is the root, we can just return the relative path
      if (settings.staticFolder === "/") {
        return relPath;
      } else if (settings.staticFolder && relPath) {
        const staticFolderParsed = parseWinPath(settings.staticFolder);
        relPath = relPath.split(staticFolderParsed).pop();
      }
    }
    return relPath;
  };

  const getFileName = () => {
    return basename(parseWinPath(media.fsPath) || '');
  };

  const copyToClipboard = () => {
    const relPath = getRelPath();
    Messenger.send(DashboardMessage.copyToClipboard, parseWinPath(relPath) || '');
  };

  const runCustomScript = (script: CustomScript) => {
    Messenger.send(DashboardMessage.runCustomScript, {
      script,
      path: media.fsPath
    });
  };

  const insertToArticle = () => {
    const relPath = getRelPath();

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
        title: media.title
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
        alt: alt || '',
        caption: caption || '',
        title: media.title || ''
      });
    }
  };

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

      const relPath = getRelPath();

      const fieldData = {
        mediaUrl: (parseWinPath(relPath) || '').replace(/ /g, '%20'),
        alt: alt || '',
        caption: caption || '',
        title: media.title || '',
        filename: basename(relPath || ''),
        mediaWidth: media?.dimensions?.width?.toString() || '',
        mediaHeight: media?.dimensions?.height?.toString() || ''
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
    [alt, caption, media, settings, viewData, mediaSnippets]
  );

  /**
   * Insert the media snippet
   */
  const insertMediaSnippetToArticle = useCallback(
    (output: string) => {
      const relPath = getRelPath();

      Messenger.send(DashboardMessage.insertMedia, {
        relPath: parseWinPath(relPath) || '',
        file: viewData?.data?.filePath,
        fieldName: viewData?.data?.fieldName,
        position: viewData?.data?.position || null,
        snippet: output
      });
    },
    [viewData]
  );

  const deleteMedia = () => {
    setShowAlert(true);
  };

  const revealMedia = () => {
    Messenger.send(DashboardMessage.revealMedia, {
      file: media.fsPath,
      folder: selectedFolder
    });
  };

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

  const viewMediaDetails = () => {
    setShowDetails(true);
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

  const customScriptActions = () => {
    return (settings?.scripts || [])
      .filter((script) => script.type === ScriptType.MediaFile && !script.hidden)
      .map((script) => (
        <MenuItem
          key={script.title}
          title={
            <div className="flex items-center">
              <CommandLineIcon className="mr-2 h-5 w-5 flex-shrink-0" aria-hidden={true} />{' '}
              <span>{script.title}</span>
            </div>
          }
          onClick={() => runCustomScript(script)}
        />
      ));
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
    if (update) {
      update();
    }
  }, [update, index]);

  useEffect(() => {
    if (media.alt !== alt) {
      setAlt(media.alt);
    }
  }, [media.alt]);

  useEffect(() => {
    if (media.caption !== caption) {
      setCaption(media.caption);
    }
  }, [media.caption]);

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
          {hasViewData && (
            <div
              className={`hidden group-hover/button:flex absolute top-0 right-0 bottom-0 left-0 items-center justify-center bg-black bg-opacity-70`}
            >
              <div
                className={`h-full ${showMediaSnippet ? 'w-1/3' : 'w-full'
                  } flex items-center justify-center`}
              >
                <button
                  title="Insert image"
                  className={`h-1/3 text-white hover:text-[var(--vscode-button-background)]`}
                  onClick={insertToArticle}
                >
                  <PlusIcon className={`w-full h-full hover:drop-shadow-md `} aria-hidden="true" />
                </button>
              </div>
              {viewData?.data?.position && mediaSnippets.length > 0 && (
                <div className={`h-full w-1/3 flex items-center justify-center`}>
                  <button
                    title="Insert snippet"
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
          <div className={`group/actions absolute top-4 right-4 flex flex-col space-y-4`}>
            <div className={`flex items-center border border-transparent rounded-full p-2 -mr-2 -mt-2 group-hover/actions:bg-[var(--vscode-sideBar-background)] group-hover/actions:border-[var(--frontmatter-border)]`}>
              <Menu as="div" className="relative z-10 flex text-left">
                <div className="hidden group-hover/actions:flex">
                  <QuickAction title="View media details" onClick={viewMediaDetails}>
                    <EyeIcon className={`w-4 h-4`} aria-hidden="true" />
                  </QuickAction>

                  <QuickAction title="Edit metadata" onClick={updateMetadata}>
                    <PencilIcon className={`w-4 h-4`} aria-hidden="true" />
                  </QuickAction>

                  {viewData?.data?.filePath ? (
                    <>
                      <QuickAction
                        title={
                          viewData.data.metadataInsert && viewData.data.fieldName
                            ? l10n.t(LocalizationKey.dashboardMediaItemQuickActionInsertField, viewData.data.fieldName)
                            : l10n.t(LocalizationKey.dashboardMediaItemQuickActionInsertMarkdown)
                        }
                        onClick={insertToArticle}
                      >
                        <PlusIcon className={`w-4 h-4`} aria-hidden="true" />
                      </QuickAction>

                      {viewData?.data?.position && mediaSnippets.length > 0 && (
                        <QuickAction title={l10n.t(LocalizationKey.commonInsertSnippet)} onClick={insertSnippet}>
                          <CodeBracketIcon className={`w-4 h-4`} aria-hidden="true" />
                        </QuickAction>
                      )}
                    </>
                  ) : (
                    <>
                      <QuickAction title={l10n.t(LocalizationKey.dashboardMediaItemQuickActionCopyPath)} onClick={copyToClipboard}>
                        <ClipboardIcon className={`w-4 h-4`} aria-hidden="true" />
                      </QuickAction>
                    </>
                  )}

                  <QuickAction title={l10n.t(LocalizationKey.dashboardMediaItemQuickActionDelete)} onClick={deleteMedia}>
                    <TrashIcon className={`w-4 h-4`} aria-hidden="true" />
                  </QuickAction>
                </div>

                <div ref={setReferenceElement} className={`flex`}>
                  <ActionMenuButton title={l10n.t(LocalizationKey.commonMenu)} />
                </div>

                <div
                  className="menu_items__wrapper z-20"
                  ref={setPopperElement}
                  style={styles.popper}
                  {...attributes.popper}
                >
                  <MenuItems widthClass="w-40">
                    <MenuItem
                      title={
                        <div className="flex items-center">
                          <PencilIcon className="mr-2 h-5 w-5 flex-shrink-0" aria-hidden={true} />{' '}
                          <span>{l10n.t(LocalizationKey.dashboardMediaItemMenuItemEditMetadata)}</span>
                        </div>
                      }
                      onClick={updateMetadata}
                    />

                    {viewData?.data?.filePath ? (
                      <>
                        <MenuItem
                          title={
                            <div className="flex items-center">
                              <PlusIcon className="mr-2 h-5 w-5 flex-shrink-0" aria-hidden={true} />{' '}
                              <span>{l10n.t(LocalizationKey.dashboardMediaItemMenuItemInsertImage)}</span>
                            </div>
                          }
                          onClick={insertToArticle}
                        />

                        {viewData?.data?.position &&
                          mediaSnippets.length > 0 &&
                          mediaSnippets.map((snippet, idx) => (
                            <MenuItem
                              key={idx}
                              title={
                                <div className="flex items-center">
                                  <CodeBracketIcon
                                    className="mr-2 h-5 w-5 flex-shrink-0"
                                    aria-hidden={true}
                                  />{' '}
                                  <span>{snippet.title}</span>
                                </div>
                              }
                              onClick={() => processSnippet(snippet)}
                            />
                          ))}

                        {customScriptActions()}
                      </>
                    ) : (
                      <>
                        <MenuItem
                          title={
                            <div className="flex items-center">
                              <ClipboardIcon
                                className="mr-2 h-5 w-5 flex-shrink-0"
                                aria-hidden={true}
                              />{' '}
                              <span>{l10n.t(LocalizationKey.dashboardMediaItemQuickActionCopyPath)}</span>
                            </div>
                          }
                          onClick={copyToClipboard}
                        />

                        {customScriptActions()}
                      </>
                    )}

                    <MenuItem
                      title={
                        <div className="flex items-center">
                          <EyeIcon className="mr-2 h-5 w-5 flex-shrink-0" aria-hidden={true} />{' '}
                          <span>{l10n.t(LocalizationKey.dashboardMediaItemMenuItemRevealMedia)}</span>
                        </div>
                      }
                      onClick={revealMedia}
                    />

                    <MenuItem
                      title={
                        <div className="flex items-center">
                          <TrashIcon className="mr-2 h-5 w-5 flex-shrink-0" aria-hidden={true} />{' '}
                          <span>{l10n.t(LocalizationKey.commonDelete)}</span>
                        </div>
                      }
                      onClick={deleteMedia}
                    />
                  </MenuItems>
                </div>
              </Menu>
            </div>
          </div>
          <p className={`text-sm font-bold pointer-events-none flex items-center break-all text-[var(--vscode-foreground)]}`}>
            {basename(parseWinPath(media.fsPath) || '')}
          </p>
          {!isImageFile && media.title && (
            <p className={`mt-2 text-xs font-medium pointer-events-none flex flex-col items-start`}>
              <b className={`mr-2`}>
                {l10n.t(LocalizationKey.dashboardMediaCommonTitle)}:
              </b>
              <span className={`block mt-1 text-xs text-[var(--vscode-foreground)]`}>{media.title}</span>
            </p>
          )}
          {media.caption && (
            <p className={`mt-2 text-xs font-medium pointer-events-none flex flex-col items-start`}>
              <b className={`mr-2`}>
                {l10n.t(LocalizationKey.dashboardMediaCommonCaption)}:
              </b>
              <span className={`block mt-1 text-xs text-[var(--vscode-foreground)]`}>{media.caption}</span>
            </p>
          )}
          {!media.caption && media.alt && (
            <p className={`mt-2 text-xs font-medium pointer-events-none  flex flex-col items-start`}>
              <b className={`mr-2`}>
                {l10n.t(LocalizationKey.dashboardMediaCommonAlt)}:
              </b>
              <span className={`block mt-1 text-xs text-[var(--vscode-foreground)]`}>{media.alt}</span>
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
