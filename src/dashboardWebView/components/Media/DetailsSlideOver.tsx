import { Dialog, Transition } from '@headlessui/react';
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import * as React from 'react';
import { Fragment, useMemo } from 'react';
import { DateHelper } from '../../../helpers/DateHelper';
import { DEFAULT_MEDIA_CONTENT_TYPE, MediaInfo } from '../../../models';
import { DetailsItem } from './DetailsItem';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { DetailsForm } from './DetailsForm';
import { useRecoilValue } from 'recoil';
import { SettingsAtom } from '../../state';
import { basename } from 'path';

export interface IDetailsSlideOverProps {
  imgSrc: string;
  size: string;
  dimensions: string;
  folder: string;
  media: MediaInfo;
  showForm: boolean;
  isImageFile: boolean;
  isVideoFile: boolean;
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
  isImageFile,
  isVideoFile
}: React.PropsWithChildren<IDetailsSlideOverProps>) => {
  const settings = useRecoilValue(SettingsAtom);
  const createdDate = useMemo(() => DateHelper.tryParse(media.ctime), [media]);
  const modifiedDate = useMemo(() => DateHelper.tryParse(media.mtime), [media]);

  const extension = useMemo(() => {
    const fileInfo = media.filename ? basename(media.filename).split('.') : null;
    const extension = fileInfo?.pop();
    return extension;
  }, [media.filename]);

  const fields = useMemo(() => {
    if (extension) {
      const contentType = settings?.media.contentTypes.find((c) => c.fileTypes?.map(t => t.toLowerCase()).includes(extension as string)) || DEFAULT_MEDIA_CONTENT_TYPE;
      return contentType.fields;
    }
  }, [extension, settings?.media.contentTypes]);

  const detailItems = useMemo(() => {
    const items = [];

    items.push(
      <DetailsItem key="filename" title={l10n.t(LocalizationKey.dashboardMediaMetadataPanelFieldFileName)} details={media.filename} />
    );

    fields?.forEach((field) => {
      if (field.name === "title") {
        items.push(
          <DetailsItem title={l10n.t(LocalizationKey.dashboardMediaCommonTitle)} details={media.metadata.title || ""} />
        );
      } else if (field.name === "caption") {
        if (isImageFile) {
          items.push(
            <DetailsItem title={l10n.t(LocalizationKey.dashboardMediaCommonCaption)} details={media.metadata.caption || ""} />
          );
        }
      } else if (field.name === "alt") {
        if (isImageFile) {
          items.push(
            <DetailsItem title={l10n.t(LocalizationKey.dashboardMediaCommonAlt)} details={media.metadata.alt || ""} />
          );
        }
      } else {
        items.push(
          <DetailsItem title={field.title || field.name} details={(media.metadata[field.name] || "") as string} />
        );
      }
    });

    return items;
  }, [fields, media.metadata]);

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog onClose={onDismiss} as={'div' as any} className="fixed inset-0 overflow-hidden z-50">
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className={`absolute inset-0 transition-opacity bg-[var(--vscode-editor-background)] opacity-75`} />

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
                <div className={`flex h-full flex-col overflow-y-scroll border-l py-6 shadow-xl bg-[var(--vscode-sideBar-background)] border-[var(--frontmatter-border)]`}>
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className={`text-lg font-medium text-[var(--vscode-editor-foreground)]`}>
                        {l10n.t(LocalizationKey.dashboardMediaDialogTitle)}
                      </Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className={`focus:outline-none text-[var(--vscode-titleBar-inactiveForeground)] hover:text-[var(--vscode-titleBar-activeForeground)]`}
                          onClick={onDismiss}
                        >
                          <span className="sr-only">{l10n.t(LocalizationKey.dashboardMediaPanelClose)}</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-6 flex-1 px-4 sm:px-6">
                    <div className="space-y-8">
                      <div>
                        {(isImageFile || isVideoFile) && (
                          <div className={`block w-full aspect-w-10 aspect-h-7 overflow-hidden border rounded border-[var(--frontmatter-border)] bg-[var(--vscode-editor-background)]`}>
                            {
                              isImageFile && (
                                <img src={imgSrc} alt={media.filename} className="object-cover max-h-[300px] mx-auto" />
                              )
                            }

                            {
                              isVideoFile && (
                                <video src={media.vsPath} className="mx-auto object-cover" controls muted />
                              )
                            }
                          </div>
                        )}
                        <div className="mt-4 flex items-start justify-between">
                          <div>
                            <h2 className={`text-lg font-medium text-[var(--frontmatter-text)]`}>
                              {media.filename}
                            </h2>
                            <p className={`text-sm font-medium text-[var(--vscode-editor-foreground)]`}>
                              {size}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        {/* EDIT METADATA FORM */}
                        {showForm && (
                          <DetailsForm
                            media={media}
                            isImageFile={isImageFile}
                            isVideoFile={isVideoFile}
                            onDismiss={onEditClose} />
                        )}

                        {!showForm && (
                          <>
                            <h3 className={`text-base flex items-center text-[var(--frontmatter-text)]`}>
                              <span>{l10n.t(LocalizationKey.dashboardMediaMetadataPanelFormMetadataTitle)}</span>
                              <button onClick={onEdit}>
                                <PencilSquareIcon className="w-4 h-4 ml-2" aria-hidden="true" />
                                <span className="sr-only">{l10n.t(LocalizationKey.commonEdit)}</span>
                              </button>
                            </h3>
                            <dl className={`mt-2 border-t border-b divide-y border-[var(--frontmatter-border)] divide-[var(--frontmatter-border)]`}>
                              {detailItems}
                            </dl>
                          </>
                        )}
                      </div>

                      {!showForm && (
                        <div>
                          <h3 className={`text-base text-[var(--frontmatter-text)]`}>
                            {l10n.t(LocalizationKey.dashboardMediaMetadataPanelFormInformationTitle)}
                          </h3>
                          <dl className={`mt-2 border-t border-b divide-y border-[var(--frontmatter-border)] divide-[var(--frontmatter-border)]`}>
                            {createdDate && (
                              <DetailsItem title={l10n.t(LocalizationKey.dashboardMediaMetadataPanelFormInformationCreatedDate)} details={format(createdDate, 'MMM dd, yyyy')} />
                            )}

                            {modifiedDate && (
                              <DetailsItem title={l10n.t(LocalizationKey.dashboardMediaMetadataPanelFormInformationModifiedDate)} details={format(modifiedDate, 'MMM dd, yyyy')} />
                            )}

                            {dimensions && (
                              <DetailsItem title={l10n.t(LocalizationKey.dashboardMediaMetadataPanelFormInformationDimensions)} details={dimensions} />
                            )}

                            {folder && (
                              <DetailsItem title={l10n.t(LocalizationKey.dashboardMediaMetadataPanelFormInformationFolder)} details={folder} />
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
