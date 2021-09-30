import { Messenger } from '@estruyf/vscode/dist/client';
import { CheckCircleIcon, ClipboardCopyIcon, CodeIcon, PencilIcon, PhotographIcon, TrashIcon } from '@heroicons/react/outline';
import { basename, dirname, parse } from 'path';
import * as React from 'react';
import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { MediaInfo } from '../../../models/MediaPaths';
import { DashboardMessage } from '../../DashboardMessage';
import { LightboxAtom, PageSelector, SelectedMediaFolderSelector, SettingsSelector, ViewDataSelector } from '../../state';
import { Alert } from '../Modals/Alert';
import { Metadata } from '../Modals/Metadata';

export interface IItemProps {
  media: MediaInfo;
}

export const Item: React.FunctionComponent<IItemProps> = ({media}: React.PropsWithChildren<IItemProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const selectedFolder = useRecoilValue(SelectedMediaFolderSelector);
  const [ , setLightbox ] = useRecoilState(LightboxAtom);
  const [ showAlert, setShowAlert ] = React.useState(false);
  const [ showForm, setShowForm ] = React.useState(false);
  const viewData = useRecoilValue(ViewDataSelector);
  const [ caption, setCaption ] = React.useState(media.caption);
  const [ alt, setAlt ] = React.useState(media.alt);
  const [ filename, setFilename ] = React.useState<string | null>(null);
  const page = useRecoilValue(PageSelector);

  const parseWinPath = (path: string | undefined) => {
    return path?.split(`\\`).join(`/`);
  }

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

  const copyToClipboard = () => {
    const relPath = getRelPath();
    Messenger.send(DashboardMessage.copyToClipboard, parseWinPath(relPath) || "");
  };

  const insertToArticle = () => {
    const relPath = getRelPath();
    Messenger.send(DashboardMessage.insertPreviewImage, {
      image: parseWinPath(relPath) || "",
      file: viewData?.data?.filePath,
      fieldName: viewData?.data?.fieldName,
      position: viewData?.data?.position || null,
      alt: alt || "",
      caption: caption || ""
    });
  };

  const insertSnippet = () => {
    const relPath = getRelPath();
    let snippet = settings?.mediaSnippet.join("\n");
    snippet = snippet?.replace("{mediaUrl}", parseWinPath(relPath) || "");
    snippet = snippet?.replace("{alt}", alt || "");
    snippet = snippet?.replace("{caption}", caption || "");

    Messenger.send(DashboardMessage.insertPreviewImage, {
      image: parseWinPath(relPath) || "",
      file: viewData?.data?.filePath,
      fieldName: viewData?.data?.fieldName,
      position: viewData?.data?.position || null,
      snippet
    });
  };

  const deleteMedia = () => {
    setShowAlert(true);
  };

  const confirmDeletion = () => {
    Messenger.send(DashboardMessage.deleteMedia, {
      file: media.fsPath,
      folder: selectedFolder
    });
  };

  const calculateSize = () => {
    let sizeDetails = [];

    if (media?.dimensions) {
      if (media.dimensions.width && media.dimensions.height) {
        sizeDetails.push(`${media.dimensions.width}x${media.dimensions.height}`);
      }
    }

    if (media?.stats?.size) {
      const size = media.stats.size / (1024*1024);
      if (size > 1) {
        sizeDetails.push(`${size.toFixed(2)} MB`);
      } else {
        sizeDetails.push(`${(size * 1024).toFixed(2)} KB`);
      }
    }

    return sizeDetails.join(" — ");
  };

  const openLightbox = () => {
    setLightbox(media.vsPath || "");
  };

  const updateMetadata = () => {
    setShowForm(true);
  };

  const submitMetadata = () => {
    Messenger.send(DashboardMessage.updateMediaMetadata, {
      file: media.fsPath,
      filename,
      caption,
      alt,
      folder: selectedFolder,
      page
    });
    setShowForm(false);
  };

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
      setFilename(name);
    }
  }, [media.fsPath]);

  const fileInfo = filename ? basename(filename).split('.') : null;
  const extension = fileInfo?.pop();
  const name = fileInfo?.join('.');

  return (
    <>
      <li className="group relative bg-gray-50 dark:bg-vulcan-200 hover:shadow-xl dark:hover:bg-vulcan-100">
        <button className="relative bg-gray-200 dark:bg-vulcan-300 block w-full aspect-w-10 aspect-h-7 overflow-hidden cursor-pointer h-48" onClick={openLightbox}>
          <div className={`absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center`}>
            <PhotographIcon className={`h-1/2 text-gray-300 dark:text-vulcan-200`} />
          </div>
          <div className={`absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center`}>
            <img src={media.vsPath} alt={basename(media.fsPath)} className="mx-auto object-cover" />
          </div>
        </button>
        <div className={`relative py-4 pl-4 pr-12`}>
          <div className={`absolute top-4 right-4 flex flex-col space-y-4`}>
            <button title={`Edit metadata`} 
                    className={`hover:text-teal-900 focus:outline-none`} 
                    onClick={updateMetadata}>
              <PencilIcon className={`h-5 w-5`} />
              <span className={`sr-only`}>Edit metadata</span>
            </button>

            {
              viewData?.data?.filePath ? (
                <>
                  <button 
                    title={`Insert into your article`} 
                    className={`hover:text-teal-900 focus:outline-none`} 
                    onClick={insertToArticle}>
                    <CheckCircleIcon className={`h-5 w-5`} />
                    <span className={`sr-only`}>Insert into your article</span>
                  </button>
                  {
                    (viewData?.data?.position && settings?.mediaSnippet && settings?.mediaSnippet.length > 0) && (
                      <button 
                        title={`Insert your media snippet`} 
                        className={`hover:text-teal-900 focus:outline-none`} 
                        onClick={insertSnippet}>
                        <CodeIcon className={`h-5 w-5`} />
                        <span className={`sr-only`}>Insert your media snippet</span>
                      </button>
                    )
                  }
                </>
              ) : (
                <>
                  <button title={`Copy media path`} 
                          className={`hover:text-teal-900 focus:outline-none`} 
                          onClick={copyToClipboard}>
                    <ClipboardCopyIcon className={`h-5 w-5`} />
                    <span className={`sr-only`}>Copy media path</span>
                  </button>
                  <button title={`Delete media`} 
                          className={`hover:text-teal-900 focus:outline-none`} 
                          onClick={deleteMedia}>
                    <TrashIcon className={`h-5 w-5`} />
                    <span className={`sr-only`}>Delete media</span>
                  </button>
                </>
              )
            }
          </div>
          <p className="text-sm dark:text-whisper-900 font-bold pointer-events-none flex items-center">
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
            media.alt && (
              <p className="mt-2 text-xs dark:text-whisper-900 font-medium pointer-events-none  flex flex-col items-start">
                <b className={`mr-2`}>Alt:</b>
                <span className={`block mt-1 dark:text-whisper-500 text-xs`}>{media.alt}</span>
              </p>
            )
          }
          <p className="mt-2 text-xs dark:text-whisper-900 font-medium pointer-events-none flex flex-col items-start">
            <b className={`mr-2`}>Folder:</b> 
            <span className={`block mt-1 dark:text-whisper-500 text-xs`}>{getFolder()}</span>
          </p>
          {
            (media?.stats?.size || media?.dimensions) && (
              <p className="mt-2 text-xs dark:text-whisper-900 font-medium pointer-events-none flex flex-col items-start">
                <b className={`mr-1`}>Size:</b>
                <span className={`block mt-1 dark:text-whisper-500 text-xs`}>{calculateSize()}</span>
              </p>
            )
          }
        </div>
      </li>

      {
        showForm && (
          <Metadata 
            title={`Set metadata for: ${basename(parseWinPath(media.fsPath) || "")}`}
            description={`Please specify the metadata you want to set for the file.`}
            okBtnText={`Save`}
            cancelBtnText={`Cancel`}
            dismiss={() => setShowForm(false)}
            trigger={submitMetadata}
            isSaveDisabled={!filename}>
            <div className="flex flex-col space-y-2">
              <div>
                <label htmlFor="about" className="block text-sm font-medium text-gray-700 dark:text-whisper-900">
                  Filename
                </label>
                <div className="relative mt-1">
                  <input
                    className="py-1 px-2 sm:text-sm bg-white dark:bg-vulcan-300 border border-gray-300 dark:border-vulcan-100 text-vulcan-500 dark:text-whisper-500 placeholder-gray-400 dark:placeholder-whisper-800 focus:outline-none w-full"
                    value={name}
                    onChange={(e) => setFilename(`${e.target.value}.${extension}`)} />

                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      .{extension}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="about" className="block text-sm font-medium text-gray-700 dark:text-whisper-900">
                  Caption
                </label>
                <div className="mt-1">
                  <textarea
                    rows={3}
                    className="py-1 px-2 sm:text-sm bg-white dark:bg-vulcan-300 border border-gray-300 dark:border-vulcan-100 text-vulcan-500 dark:text-whisper-500 placeholder-gray-400 dark:placeholder-whisper-800 focus:outline-none w-full"
                    value={caption || ''}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="about" className="block text-sm font-medium text-gray-700 dark:text-whisper-900">
                  Alt tag value
                </label>
                <div className="mt-1">
                  <input
                    className="py-1 px-2 sm:text-sm bg-white dark:bg-vulcan-300 border border-gray-300 dark:border-vulcan-100 text-vulcan-500 dark:text-whisper-500 placeholder-gray-400 dark:placeholder-whisper-800 focus:outline-none w-full"
                    value={alt || ''}
                    onChange={(e) => setAlt(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Metadata>
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