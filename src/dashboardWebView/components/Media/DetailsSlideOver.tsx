import { Dialog, Transition } from '@headlessui/react';
import { PencilAltIcon, XIcon } from '@heroicons/react/outline';
import { format } from 'date-fns';
import { basename } from 'path';
import * as React from 'react';
import { Fragment, useCallback, useMemo } from 'react';
import { DateHelper } from '../../../helpers/DateHelper';
import { MediaInfo } from '../../../models';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { useRecoilValue } from 'recoil';
import { PageSelector, SelectedMediaFolderSelector } from '../../state';
import useThemeColors from '../../hooks/useThemeColors';
import { DetailsItem } from './DetailsItem';
import { DetailsInput } from './DetailsInput';

export interface IDetailsSlideOverProps {
  imgSrc: string;
  size: string;
  dimensions: string;
  folder: string;
  media: MediaInfo;
  showForm: boolean;
  isImageFile: boolean;
  onEdit: () => void;
  onEditClose: () => void;
  onDismiss: () => void;
}

export const DetailsSlideOver: React.FunctionComponent<IDetailsSlideOverProps> = ({
  imgSrc,
  size,
  dimensions,
  media,
  folder,
  showForm,
  onEdit,
  onEditClose,
  onDismiss,
  isImageFile
}: React.PropsWithChildren<IDetailsSlideOverProps>) => {
  const [filename, setFilename] = React.useState<string>(media.filename);
  const [caption, setCaption] = React.useState<string | undefined>(media.caption);
  const [title, setTitle] = React.useState<string | undefined>(media.title);
  const [alt, setAlt] = React.useState(media.alt);
  const selectedFolder = useRecoilValue(SelectedMediaFolderSelector);
  const page = useRecoilValue(PageSelector);
  const { getColors } = useThemeColors();

  const createdDate = useMemo(() => DateHelper.tryParse(media.ctime), [media]);
  const modifiedDate = useMemo(() => DateHelper.tryParse(media.mtime), [media]);

  const fileInfo = filename ? basename(filename).split('.') : null;
  const extension = fileInfo?.pop();
  const name = fileInfo?.join('.');

  const onSubmitMetadata = useCallback(() => {
    Messenger.send(DashboardMessage.updateMediaMetadata, {
      file: media.fsPath,
      filename,
      caption,
      alt,
      title,
      folder: selectedFolder,
      page
    });

    onEditClose();
  }, [media, filename, caption, alt, title, selectedFolder, page]);

  React.useEffect(() => {
    setTitle(media.title);
    setAlt(media.alt);
    setCaption(media.caption);
    setFilename(media.filename);
  }, [media]);

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog onClose={onDismiss} as={'div' as any} className="fixed inset-0 overflow-hidden z-50">
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className={`absolute inset-0 transition-opacity ${
            getColors(
              'bg-vulcan-500 bg-opacity-75',
              'bg-[var(--vscode-editor-background)] opacity-75'
            )
          }`} />

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
                <div className={`flex h-full flex-col overflow-y-scroll border-l py-6 shadow-xl ${
                  getColors(
                    `bg-white dark:bg-vulcan-400 border-whisper-900 dark:border-vulcan-50`,
                    `bg-[var(--vscode-sideBar-background)] border-[var(--vscode-panel-border)]`
                  )
                }`}>
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className={`text-lg font-medium ${
                        getColors(
                          'text-vulcan-300 dark:text-whisper-900',
                          'text-[var(--vscode-editor-foreground)]'
                        )
                      }`}>
                        View details
                      </Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className={`focus:outline-none ${
                            getColors(
                              'text-vulcan-300 dark:text-whisper-900 hover:text-vulcan-500 dark:hover:text-whisper-500',
                              'text-[var(--vscode-titleBar-inactiveForeground)] hover:text-[var(--vscode-titleBar-activeForeground)]'
                            )
                          }`}
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
                        {isImageFile && (
                          <div className={`block w-full aspect-w-10 aspect-h-7 overflow-hidden border rounded ${
                            getColors(
                              'border-gray-200 dark:border-vulcan-200',
                              'border-[var(--vscode-panel-border)] bg-[var(--vscode-editor-background)]'
                            )
                          }`}>
                            <img src={imgSrc} alt={media.filename} className="object-cover max-h-[300px] mx-auto" />
                          </div>
                        )}
                        <div className="mt-4 flex items-start justify-between">
                          <div>
                            <h2 className={`text-lg font-medium ${
                              getColors(
                                'text-vulcan-300 dark:text-whisper-500',
                                'text-[var(--vscode-foreground)]'
                              )
                            }`}>
                              <span className="sr-only">Details for </span>
                              {media.filename}
                            </h2>
                            <p className={`text-sm font-medium ${
                              getColors(
                                'text-vulcan-100 dark:text-whisper-900',
                                'text-[var(--vscode-editor-foreground)]'
                              )
                            }`}>
                              {size}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        {/* EDIT METADATA FORM */}
                        {showForm && (
                          <>
                            <h3 className={`text-base  ${
                              getColors(
                                'text-vulcan-300 dark:text-whisper-500',
                                'text-[var(--vscode-editor-foreground)]'
                              )
                            }`}>
                              Update metadata
                            </h3>
                            <p className={`text-sm font-medium ${
                              getColors(
                                'text-vulcan-100 dark:text-whisper-900',
                                'text-[var(--vscode-editor-foreground)]'
                              )
                            }`}>
                              Please specify the metadata you want to set for the file.
                            </p>
                            <div className="flex flex-col py-3 space-y-3">
                              <div>
                                <label className={`block text-sm font-medium  ${
                                  getColors(
                                    'text-gray-700 dark:text-whisper-900',
                                    'text-[var(--vscode-editor-foreground)]'
                                  )
                                }`}>
                                  Filename
                                </label>
                                <div className="relative mt-1">
                                  <DetailsInput value={name || ""} onChange={(e) => setFilename(`${e.target.value}.${extension}`)} />

                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className={`sm:text-sm ${getColors('text-gray-500', 'placeholder-[var(--vscode-input-placeholderForeground)]')}`}>.{extension}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className={`block text-sm font-medium ${
                                  getColors(
                                    'text-gray-700 dark:text-whisper-900',
                                    'text-[var(--vscode-editor-foreground)]'
                                  )
                                }`}>
                                  Title
                                </label>
                                <div className="mt-1">
                                  <DetailsInput value={title || ""} onChange={(e) => setTitle(e.target.value)} />
                                </div>
                              </div>

                              {isImageFile && (
                                <>
                                  <div>
                                    <label className={`block text-sm font-medium ${
                                      getColors(
                                        'text-gray-700 dark:text-whisper-900',
                                        'text-[var(--vscode-editor-foreground)]'
                                      )
                                    }`}>
                                      Caption
                                    </label>
                                    <div className="mt-1">
                                      <DetailsInput value={caption || ""} onChange={(e) => setCaption(e.target.value)} isTextArea />
                                    </div>
                                  </div>
                                  <div>
                                    <label className={`block text-sm font-medium ${
                                      getColors(
                                        'text-gray-700 dark:text-whisper-900',
                                        'text-[var(--vscode-editor-foreground)]'
                                      )
                                    }`}>
                                      Alt tag value
                                    </label>
                                    <div className="mt-1">
                                      <DetailsInput value={alt || ""} onChange={(e) => setAlt(e.target.value)} isTextArea />
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                              <button
                                type="button"
                                className={`w-full inline-flex justify-center rounded border-transparent shadow-sm px-4 py-2 text-base font-medium sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-30 ${
                                  getColors(
                                    'border focus:outline-none focus:ring-2 focus:ring-offset-2 text-white bg-teal-600 hover:bg-teal-700 dark:hover:bg-teal-900 focus:ring-teal-500',
                                    'bg-[var(--vscode-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] text-[var(--vscode-button-foreground)] outline-[var(--vscode-focusBorder)] outline-1'
                                  )
                                }`}
                                onClick={onSubmitMetadata}
                                disabled={!filename}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className={`mt-3 w-full inline-flex justify-center rounded shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:mt-0 sm:w-auto sm:text-sm ${
                                  getColors(
                                    'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-200',
                                    'bg-[var(--vscode-button-secondaryBackground)] hover:bg-[var(--vscode-button-secondaryHoverBackground)] text-[var(--vscode-button-secondaryForeground)]'
                                  )
                                }`}
                                onClick={onEditClose}
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        )}

                        {!showForm && (
                          <>
                            <h3 className={`text-base flex items-center ${
                              getColors(
                                'text-vulcan-300 dark:text-whisper-500',
                                'text-[var(--vscode-foreground)]'
                              )
                            }`}>
                              <span>Metadata</span>
                              <button onClick={onEdit}>
                                <PencilAltIcon className="w-4 h-4 ml-2" aria-hidden="true" />
                                <span className="sr-only">Edit</span>
                              </button>
                            </h3>
                            <dl className={`mt-2 border-t border-b divide-y ${
                              getColors(
                                'border-gray-200 dark:border-vulcan-200 divide-gray-200 dark:divide-vulcan-200',
                                'border-[var(--vscode-panel-border)] divide-[var(--vscode-panel-border)]'
                              )
                            }`}>
                              <DetailsItem title={`Filename`} details={media.filename} />
                              <DetailsItem title={`Title`} details={media.title || ""} />

                              {isImageFile && (
                                <>
                                  <DetailsItem title={`Caption`} details={media.caption || ''} />
                                  <DetailsItem title={`Alternate text`} details={media.alt || ''} />
                                </>
                              )}
                            </dl>
                          </>
                        )}
                      </div>

                      {!showForm && (
                        <div>
                          <h3 className={`text-base ${
                            getColors(
                              'text-vulcan-300 dark:text-whisper-500', 
                              'text-[var(--vscode-foreground)]'
                            )
                          }`}>
                            Information
                          </h3>
                          <dl className={`mt-2 border-t border-b divide-y ${
                            getColors(
                              'border-gray-200 dark:border-vulcan-200 divide-gray-200 dark:divide-vulcan-200',
                              'border-[var(--vscode-panel-border)] divide-[var(--vscode-panel-border)]'
                            )
                          }`}>
                            {createdDate && (
                              <DetailsItem title={`Created`} details={format(createdDate, 'MMM dd, yyyy')} />
                            )}

                            {modifiedDate && (
                              <DetailsItem title={`Last modified`} details={format(modifiedDate, 'MMM dd, yyyy')} />
                            )}

                            {dimensions && (
                              <DetailsItem title={`Dimensions`} details={dimensions} />
                            )}

                            {folder && (
                              <DetailsItem title={`Folder`} details={folder} />
                            )}
                          </dl>
                        </div>
                      )}
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
