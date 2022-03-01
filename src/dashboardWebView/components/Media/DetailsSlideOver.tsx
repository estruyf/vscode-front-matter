import { Dialog, Transition } from '@headlessui/react';
import { PencilAltIcon, XIcon } from '@heroicons/react/outline';
import { format } from 'date-fns';
import { basename } from 'path';
import * as React from 'react';
import { Fragment, useMemo } from 'react';
import { DateHelper } from '../../../helpers/DateHelper';
import { MediaInfo } from '../../../models';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { useRecoilValue } from 'recoil';
import { PageSelector, SelectedMediaFolderSelector } from '../../state';

export interface IDetailsSlideOverProps {
  imgSrc: string;
  size: string;
  dimensions: string;
  folder: string;
  media: MediaInfo;
  showForm: boolean;
  onEdit: () => void;
  onEditClose: () => void;
  onDismiss: () => void;
}

export const DetailsSlideOver: React.FunctionComponent<IDetailsSlideOverProps> = ({ imgSrc, size, dimensions, media, folder, showForm, onEdit, onEditClose, onDismiss }: React.PropsWithChildren<IDetailsSlideOverProps>) => {
  const [ filename, setFilename ] = React.useState<string>(media.filename);
  const [ caption, setCaption ] = React.useState<string | undefined>(media.caption);
  const [ alt, setAlt ] = React.useState(media.alt);
  const selectedFolder = useRecoilValue(SelectedMediaFolderSelector);
  const page = useRecoilValue(PageSelector);

  const createdDate = useMemo(() => DateHelper.tryParse(media.ctime), [media]);
  const modifiedDate = useMemo(() => DateHelper.tryParse(media.mtime), [media]);

  const fileInfo = filename ? basename(filename).split('.') : null;
  const extension = fileInfo?.pop();
  const name = fileInfo?.join('.');

  const onSubmitMetadata = () => {
    Messenger.send(DashboardMessage.updateMediaMetadata, {
      file: media.fsPath,
      filename,
      caption,
      alt,
      folder: selectedFolder,
      page
    });
    
    onEditClose();
  };

  React.useEffect(() => {
    setAlt(media.alt);
    setCaption(media.caption);
    setFilename(media.filename);
  }, [media]);

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog onClose={onDismiss} as={'div' as any} className="fixed inset-0 overflow-hidden z-50">
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0 bg-vulcan-500 bg-opacity-75 transition-opacity" />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-vulcan-400 border-l border-whisper-900 dark:border-vulcan-50 py-6 shadow-xl">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-vulcan-300 dark:text-whisper-900">View details</Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="text-vulcan-300 dark:text-whisper-900 hover:text-vulcan-500 dark:hover:text-whisper-500 focus:outline-none"
                          onClick={onDismiss}
                        >
                          <span className="sr-only">Close panel</span>
                          <XIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-6 flex-1 px-4 sm:px-6">
                    <div className="absolute inset-0 px-4 sm:px-6 space-y-8">
                      <div>
                        <div className="block w-full aspect-w-10 aspect-h-7 overflow-hidden border-gray-200 dark:border-vulcan-200 border">
                          <img src={imgSrc} alt={media.filename} className="object-cover" />
                        </div>
                        <div className="mt-4 flex items-start justify-between">
                          <div>
                            <h2 className="text-lg font-medium text-vulcan-300 dark:text-whisper-500"><span className="sr-only">Details for </span>{media.filename}</h2>
                            <p className="text-sm font-medium text-vulcan-100 dark:text-whisper-900">{size}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        {
                          showForm && (
                            <>
                              <h3 className="text-base text-vulcan-300 dark:text-whisper-500">Update metadata</h3>
                              <p className="text-sm font-medium text-vulcan-100 dark:text-whisper-900">Please specify the metadata you want to set for the file.</p>
                              <div className="flex flex-col py-3 space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-whisper-900">
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
                                  <label className="block text-sm font-medium text-gray-700 dark:text-whisper-900">
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
                                  <label className="block text-sm font-medium text-gray-700 dark:text-whisper-900">
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

                              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                  type="button"
                                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 dark:hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-30"
                                  onClick={onSubmitMetadata}
                                  disabled={!filename}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-200 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                                  onClick={onEditClose}
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          )
                        }


                        {
                          !showForm && (
                            <>
                              <h3 className="text-base text-vulcan-300 dark:text-whisper-500 flex items-center">
                                <span>Metadata</span>
                                <button onClick={onEdit}>
                                  <PencilAltIcon className='w-4 h-4 ml-2' aria-hidden="true" />
                                  <span className='sr-only'>Edit</span>
                                </button>
                              </h3>
                              <dl className="mt-2 border-t border-b border-gray-200 dark:border-vulcan-200 divide-y divide-gray-200 dark:divide-vulcan-200">
                                <div className="py-3 flex justify-between text-sm font-medium">
                                  <dt className="text-vulcan-100 dark:text-whisper-900">Filename</dt>
                                  <dd className="text-vulcan-300 dark:text-whisper-500 text-right">{media.filename}</dd>
                                </div>
                                
                                <div className="py-3 flex justify-between text-sm font-medium">
                                  <dt className="text-vulcan-100 dark:text-whisper-900">Caption</dt>
                                  <dd className="text-vulcan-300 dark:text-whisper-500 text-right">{media.caption || ""}</dd>
                                </div>
                                
                                <div className="py-3 flex justify-between text-sm font-medium">
                                  <dt className="text-vulcan-100 dark:text-whisper-900">Alternate text</dt>
                                  <dd className="text-vulcan-300 dark:text-whisper-500 text-right">{media.alt || ""}</dd>
                                </div>
                              </dl>
                            </>
                          )
                        }
                      </div>
                      
                      {
                        !showForm && (
                          <div>
                            <h3 className="text-base text-vulcan-300 dark:text-whisper-500">Information</h3>
                            <dl className="mt-2 border-t border-b border-gray-200 dark:border-vulcan-200 divide-y divide-gray-200 dark:divide-vulcan-200">
                            
                              {
                                createdDate && (
                                  <div className="py-3 flex justify-between text-sm font-medium">
                                    <dt className="text-vulcan-100 dark:text-whisper-900">Created</dt>
                                    <dd className="text-vulcan-300 dark:text-whisper-500 text-right">{format(createdDate, 'MMM dd, yyyy')}</dd>
                                  </div>
                                )
                              }

                              {
                                modifiedDate && (
                                  <div className="py-3 flex justify-between text-sm font-medium">
                                    <dt className="text-vulcan-100 dark:text-whisper-900">Last modified</dt>
                                    <dd className="text-vulcan-300 dark:text-whisper-500 text-right">{format(modifiedDate, 'MMM dd, yyyy')}</dd>
                                  </div>
                                )
                              }
                            
                              {
                                dimensions && (
                                  <div className="py-3 flex justify-between text-sm font-medium">
                                    <dt className="text-vulcan-100 dark:text-whisper-900">Dimensions</dt>
                                    <dd className="text-vulcan-300 dark:text-whisper-500 text-right">{dimensions}</dd>
                                  </div>
                                )
                              }

                              {
                                folder && (
                                  <div className="py-3 flex justify-between text-sm font-medium">
                                    <dt className="text-vulcan-100 dark:text-whisper-900">Folder</dt>
                                    <dd className="text-vulcan-300 dark:text-whisper-500 text-right break-all ml-6">{folder}</dd>
                                  </div>
                                )
                              }
                              
                            </dl>
                          </div>
                        )
                      }
                    </div>

                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};