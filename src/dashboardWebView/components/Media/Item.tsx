import { Messenger } from '@estruyf/vscode/dist/client';
import { Menu } from '@headlessui/react';
import { ClipboardIcon, CodeIcon, DocumentIcon, EyeIcon, MusicNoteIcon, PencilIcon, PhotographIcon, PlusIcon, TrashIcon, VideoCameraIcon } from '@heroicons/react/outline';
import { basename, dirname } from 'path';
import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { CustomScript } from '../../../helpers/CustomScript';
import { parseWinPath } from '../../../helpers/parseWinPath';
import { ScriptType } from '../../../models';
import { MediaInfo } from '../../../models/MediaPaths';
import { DashboardMessage } from '../../DashboardMessage';
import { LightboxAtom, SelectedMediaFolderSelector, SettingsSelector, ViewDataSelector } from '../../state';
import { MenuItem, MenuItems } from '../Menu';
import { ActionMenuButton } from '../Menu/ActionMenuButton';
import { QuickAction } from '../Menu/QuickAction';
import { Alert } from '../Modals/Alert';
import { DetailsSlideOver } from './DetailsSlideOver';
 
export interface IItemProps {
  media: MediaInfo;
}

export const Item: React.FunctionComponent<IItemProps> = ({media}: React.PropsWithChildren<IItemProps>) => {
  const [ , setLightbox ] = useRecoilState(LightboxAtom);
  const [ showAlert, setShowAlert ] = React.useState(false);
  const [ showForm, setShowForm ] = React.useState(false);
  const [ showDetails, setShowDetails ] = React.useState(false);
  const [ caption, setCaption ] = React.useState(media.caption);
  const [ alt, setAlt ] = React.useState(media.alt);
  const [ filename, setFilename ] = React.useState<string | null>(null);
  const settings = useRecoilValue(SettingsSelector);
  const selectedFolder = useRecoilValue(SelectedMediaFolderSelector);
  const viewData = useRecoilValue(ViewDataSelector);

  const getFolder = () => {
    if (settings?.wsFolder && media.fsPath) {
      let relPath = media.fsPath.split(settings.wsFolder).pop();

      if (settings.staticFolder && relPath) {
        relPath = relPath.split(settings.staticFolder).pop();
      }

      return dirname(parseWinPath(relPath) || "");
    }
    return "";
  };

  const getRelPath = () => {
    let relPath: string | undefined = "";
    if (settings?.wsFolder && media.fsPath) {
      relPath = media.fsPath.split(settings.wsFolder).pop();

      if (settings.staticFolder && relPath) {
        relPath = relPath.split(settings.staticFolder).pop();
      }
    }
    return relPath;
  };

  const getFileName = () => {
    return basename(parseWinPath(media.fsPath) || "");
  };

  const copyToClipboard = () => {
    const relPath = getRelPath();
    Messenger.send(DashboardMessage.copyToClipboard, parseWinPath(relPath) || "");
  };

  const runCustomScript = (script: CustomScript) => {
    Messenger.send(DashboardMessage.runCustomScript, {script, path: media.fsPath});
  };

  const insertToArticle = () => {
    const relPath = getRelPath();

    if (viewData?.data?.type === "file") {
      Messenger.send(DashboardMessage.insertFile, {
        relPath: parseWinPath(relPath) || "",
        file: viewData?.data?.filePath,
        fieldName: viewData?.data?.fieldName,
        parents: viewData?.data?.parents,
        multiple: viewData?.data?.multiple,
        value: viewData?.data?.value,
        position: viewData?.data?.position || null,
        blockData: typeof viewData?.data?.blockData !== "undefined" ? viewData?.data?.blockData : undefined
      });
    } else {
      Messenger.send(DashboardMessage.insertPreviewImage, {
        relPath: parseWinPath(relPath) || "",
        file: viewData?.data?.filePath,
        fieldName: viewData?.data?.fieldName,
        parents: viewData?.data?.parents,
        multiple: viewData?.data?.multiple,
        value: viewData?.data?.value,
        position: viewData?.data?.position || null,
        blockData: typeof viewData?.data?.blockData !== "undefined" ? viewData?.data?.blockData : undefined,
        alt: alt || "",
        caption: caption || ""
      });
    }
  };

  const insertSnippet = () => {
    const relPath = getRelPath();
    let snippet = settings?.mediaSnippet.join("\n");

    snippet = snippet?.replace("{mediaUrl}", parseWinPath(relPath) || "");
    snippet = snippet?.replace("{alt}", alt || "");
    snippet = snippet?.replace("{caption}", caption || "");
    snippet = snippet?.replace("{filename}", basename(relPath || ""));
    snippet = snippet?.replace("{mediaWidth}", media?.dimensions?.width?.toString() || "");
    snippet = snippet?.replace("{mediaHeight}", media?.dimensions?.height?.toString() || "");

    Messenger.send(DashboardMessage.insertPreviewImage, {
      relPath: parseWinPath(relPath) || "",
      file: viewData?.data?.filePath,
      fieldName: viewData?.data?.fieldName,
      position: viewData?.data?.position || null,
      snippet
    });
  };

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
    return "";
  };

  const getSize = () => {

    if (media?.size) {
      const size = media.size / (1024*1024);
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

    return sizeDetails.join(" - ");
  };

  const viewMediaDetails = () => {
    setShowDetails(true);
  };

  const openLightbox = useCallback(() => {
    if (isImageFile) {
      setLightbox(media.vsPath || "");
    }
  }, [media.vsPath]);

  const updateMetadata = () => {
    setShowForm(true);
    setShowDetails(true);
  };

  const customScriptActions = () => {
    return (settings?.scripts || []).filter(script => script.type === ScriptType.MediaFile).map(script => (
      <MenuItem 
        key={script.title}
        title={script.title} 
        onClick={() => runCustomScript(script)} />
    ))
  }

  const isVideoFile = useMemo(() => {
    if (media.mimeType?.startsWith("video/")) {
      return true;
    }
    return false;
  }, [media]);

  const isAudioFile = useMemo(() => {
    if (media.mimeType?.startsWith("audio/")) {
      return true;
    }
    return false;
  }, [media]);

  const isImageFile = useMemo(() => {
    if (media.mimeType?.startsWith("image/")) {
      return true;
    }
    return false;
  }, [media]);

  const renderMediaIcon = useMemo(() => {
    const path = media.fsPath;
    const extension = path.split('.').pop();

    if (isImageFile) {
      return <PhotographIcon className={`h-1/2 text-gray-300 dark:text-vulcan-200`} />;
    }

    let icon = <DocumentIcon className={`h-4/6 text-gray-300 dark:text-vulcan-200`} />;

    if (isVideoFile) {
      icon = <VideoCameraIcon className={`h-4/6 text-gray-300 dark:text-vulcan-200`} />;
    }
    
    if (isAudioFile) {
      icon = <MusicNoteIcon className={`h-4/6 text-gray-300 dark:text-vulcan-200`} />;
    }

    return (
      <div className='w-full h-full flex justify-center items-center'>
        {icon}
        <span className='text-2xl font-bold absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center'>{extension}</span>
      </div>
    );
  }, [media, isImageFile, isVideoFile, isAudioFile]);
  
  const renderMedia = useMemo(() => {
    if (isVideoFile || isAudioFile) {
      return null;
    }

    if (isImageFile) {
      return <img src={media.vsPath} alt={basename(media.fsPath)} className="mx-auto object-cover" />;
    }

    return null;
  }, [media]);

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
    const name = basename(parseWinPath(media.fsPath) || "");
    if (name !== filename) {
      setFilename(getFileName());
    }
  }, [media.fsPath]);

  return (
    <>
      <li className="group relative bg-gray-50 dark:bg-vulcan-200 shadow-md hover:shadow-xl dark:shadow-none dark:hover:bg-vulcan-100 border border-gray-200 dark:border-vulcan-50">
        <button className={`relative bg-gray-200 dark:bg-vulcan-300 block w-full aspect-w-10 aspect-h-7 overflow-hidden  h-48 ${isImageFile ? "cursor-pointer" : "cursor-default"}`} onClick={openLightbox}>
          <div className={`absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center`}>
            {
              renderMediaIcon
            }
          </div>
          <div className={`absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center`}>
            { renderMedia }
          </div>
        </button>
        <div className={`relative py-4 pl-4 pr-12`}>
          <div className={`group-scope absolute top-4 right-4 flex flex-col space-y-4`}>

            <div className="flex items-center border border-transparent group-scope-hover:bg-gray-200 dark:group-scope-hover:bg-vulcan-200 group-scope-hover:border-gray-100 dark:group-scope-hover:border-vulcan-50 rounded-full p-2 -mr-2 -mt-2">

              <Menu as="div" className="relative z-10 flex text-left">
                <div className='hidden group-scope-hover:flex'>
                  <QuickAction 
                    title='View media details'
                    onClick={viewMediaDetails}>
                    <EyeIcon className={`w-4 h-4`} aria-hidden="true" />
                  </QuickAction>

                  <QuickAction 
                    title='Edit metadata'
                    onClick={updateMetadata}>
                    <PencilIcon className={`w-4 h-4`} aria-hidden="true" />
                  </QuickAction>

                  {
                    viewData?.data?.filePath ? (
                      <>
                        <QuickAction 
                          title={(viewData.data.metadataInsert && viewData.data.fieldName) ? `Insert image for your "${viewData.data.fieldName}" field` : `Insert image with markdown markup`}
                          onClick={insertToArticle}>
                          <PlusIcon className={`w-4 h-4`} aria-hidden="true" />
                        </QuickAction>

                        {
                          (viewData?.data?.position && settings?.mediaSnippet && settings?.mediaSnippet.length > 0) && (
                            <QuickAction 
                              title='Insert snippet'
                              onClick={insertSnippet}>
                              <CodeIcon className={`w-4 h-4`} aria-hidden="true" />
                            </QuickAction>
                          )
                        }
                      </>
                    ) : (
                      <>
                        <QuickAction 
                          title='Copy media path'
                          onClick={copyToClipboard}>
                          <ClipboardIcon className={`w-4 h-4`} aria-hidden="true" />
                        </QuickAction>
                      </>
                    )
                  }

                  <QuickAction 
                    title='Delete media file'
                    onClick={deleteMedia}>
                    <TrashIcon className={`w-4 h-4`} aria-hidden="true" />
                  </QuickAction>
                </div>

                <ActionMenuButton title={`Menu`} />

                <MenuItems widthClass='w-40'>
                  <MenuItem 
                    title={`Edit metadata`}
                    onClick={updateMetadata}
                    />

                  {
                    viewData?.data?.filePath ? (
                      <>
                        <MenuItem 
                          title={`Insert image markdown`}
                          onClick={insertToArticle} />

                        {
                          (viewData?.data?.position && settings?.mediaSnippet && settings?.mediaSnippet.length > 0) && (
                            <MenuItem 
                              title={`Insert snippet`}
                              onClick={insertSnippet} />
                          )
                        }

                        { customScriptActions() }
                      </>
                    ) : (
                      <>
                        <MenuItem 
                          title={`Copy media path`}
                          onClick={copyToClipboard} />

                        { customScriptActions() }
                      </>
                    )
                  }

                  <MenuItem 
                    title={`Reveal media`}
                    onClick={revealMedia} />

                  <MenuItem 
                    title={`Delete`}
                    onClick={deleteMedia} />
                </MenuItems>
              </Menu>
            </div>

          </div>
          <p className="text-sm dark:text-whisper-900 font-bold pointer-events-none flex items-center break-all">
            {basename(parseWinPath(media.fsPath) || "")}
          </p>
          {
            media.caption && (
              <p className="mt-2 text-xs dark:text-whisper-900 font-medium pointer-events-none flex flex-col items-start">
                <b className={`mr-2`}>Caption:</b>
                <span className={`block mt-1 dark:text-whisper-500 text-xs`}>{media.caption}</span>
              </p>
            )
          }
          {
            (!media.caption && media.alt) && (
              <p className="mt-2 text-xs dark:text-whisper-900 font-medium pointer-events-none  flex flex-col items-start">
                <b className={`mr-2`}>Alt:</b>
                <span className={`block mt-1 dark:text-whisper-500 text-xs`}>{media.alt}</span>
              </p>
            )
          }
          {
            (media?.size || media?.dimensions) && (
              <p className="mt-2 text-xs dark:text-whisper-900 font-medium pointer-events-none flex flex-col items-start">
                <b className={`mr-1`}>Size:</b>
                <span className={`block mt-1 dark:text-whisper-500 text-xs`}>{getMediaDetails()}</span>
              </p>
            )
          }
        </div>
      </li>

      {
        showDetails && (
          <DetailsSlideOver
            imgSrc={media.vsPath || ""}
            size={getSize()}
            dimensions={getDimensions()}
            folder={getFolder()}
            media={media}
            showForm={showForm}
            isImageFile={isImageFile}
            onEdit={() => setShowForm(true)}
            onEditClose={() => setShowForm(false)}
            onDismiss={() => { setShowDetails(false); setShowForm(false); }} />
        )
      }

      {
        showAlert && (
          <Alert 
            title={`Delete: ${basename(parseWinPath(media.fsPath) || "")}`}
            description={`Are you sure you want to delete the file from the ${getFolder()} folder?`}
            okBtnText={`Delete`}
            cancelBtnText={`Cancel`}
            dismiss={() => setShowAlert(false)}
            trigger={confirmDeletion} />
        )
      }
    </>
  );
};