import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { DetailsInput } from './DetailsInput';
import { LocalizationKey } from '../../../localization';
import { DEFAULT_MEDIA_CONTENT_TYPE, MediaInfo, UnmappedMedia } from '../../../models';
import { useCallback, useEffect, useMemo } from 'react';
import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { basename } from 'path';
import { useRecoilValue } from 'recoil';
import { PageSelector, SelectedMediaFolderSelector, SettingsAtom } from '../../state';

export interface IDetailsFormProps {
  media: MediaInfo;
  isImageFile: boolean;
  isVideoFile: boolean;
  onDismiss: () => void;
}

export const DetailsForm: React.FunctionComponent<IDetailsFormProps> = ({
  media,
  isImageFile,
  isVideoFile,
  onDismiss,
}: React.PropsWithChildren<IDetailsFormProps>) => {
  const settings = useRecoilValue(SettingsAtom);
  const selectedFolder = useRecoilValue(SelectedMediaFolderSelector);
  const page = useRecoilValue(PageSelector);

  const [filename, setFilename] = React.useState<string>(media.filename);
  const [unmapped, setUnmapped] = React.useState<UnmappedMedia[]>([]);
  const [metadata, setMetadata] = React.useState<{ [fieldName: string]: string }>({});

  const fileInfo = useMemo(() => {
    const fileInfo = filename ? basename(filename).split('.') : null;
    const extension = fileInfo?.pop();
    const name = fileInfo?.join('.');

    return { name, extension };
  }, [filename]);

  const fields = useMemo(() => {
    const contentType = settings?.media.contentTypes.find((c) => c.fileTypes?.map(t => t.toLowerCase()).includes(fileInfo.extension as string)) || DEFAULT_MEDIA_CONTENT_TYPE;
    return contentType.fields;
  }, [fileInfo, settings?.media.contentTypes]);

  const updateMetadata = useCallback((fieldName: string, value: string) => {
    setMetadata(prevMetadata => ({
      ...prevMetadata,
      [fieldName]: value
    }));
  }, [metadata]);

  const remapMetadata = useCallback((item: UnmappedMedia) => {
    Messenger.send(DashboardMessage.remapMediaMetadata, {
      file: media.fsPath,
      unmappedItem: item,
      folder: selectedFolder,
      page
    });

    onDismiss();
  }, [media, selectedFolder, page]);

  const onSubmitMetadata = useCallback(() => {
    Messenger.send(DashboardMessage.updateMediaMetadata, {
      file: media.fsPath,
      filename,
      page,
      folder: selectedFolder,
      metadata,
    });

    onDismiss();
  }, [media, filename, metadata, selectedFolder, page, onDismiss]);

  const formFields = useMemo(() => {
    return fields.map((field) => {
      if (field.name === "title") {
        return (
          <div key="title">
            <label className={`block text-sm font-medium text-[var(--vscode-editor-foreground)]`}>
              {l10n.t(LocalizationKey.dashboardMediaCommonTitle)}
            </label>
            <div className="mt-1">
              <DetailsInput name={`title`} value={metadata?.title || ""} onChange={(e) => updateMetadata("title", e)} />
            </div>
          </div>
        );
      }

      if (field.name === "caption") {
        if (isImageFile || isVideoFile) {
          return (
            <div key="caption">
              <label className={`block text-sm font-medium text-[var(--vscode-editor-foreground)]`}>
                {l10n.t(LocalizationKey.dashboardMediaCommonCaption)}
              </label>
              <div className="mt-1">
                <DetailsInput name={`caption`} value={metadata?.caption || ""} onChange={(e) => updateMetadata("caption", e)} isTextArea />
              </div>
            </div>
          )
        } else {
          return null;
        }
      }

      if (field.name === "alt") {
        if (isImageFile) {
          return (
            <div key="alt">
              <label className={`block text-sm font-medium text-[var(--vscode-editor-foreground)]`}>
                {l10n.t(LocalizationKey.dashboardMediaCommonAlt)}
              </label>
              <div className="mt-1">
                <DetailsInput name={`alt`} value={metadata?.alt || ""} onChange={(e) => updateMetadata("alt", e)} isTextArea />
              </div>
            </div>
          )
        } else {
          return null;
        }
      }

      return (
        <div key={field.name}>
          <label className={`block text-sm font-medium text-[var(--vscode-editor-foreground)]`}>
            {field.title || field.name}
          </label>
          <div className="mt-1">
            <DetailsInput name={field.name} value={metadata[field.name] || ""} onChange={(e) => updateMetadata(field.name, e)} isTextArea={!field.single} />
          </div>
        </div>
      );
    });
  }, [fields, metadata, updateMetadata]);

  useEffect(() => {
    if (fields && media.metadata && fileInfo?.extension) {
      const metadataFields: { [fieldName: string]: string } = {};

      fields.forEach((field) => {
        metadataFields[field.name] = (media.metadata[field.name] || '') as string;
      });

      setMetadata(metadataFields);
    }
  }, [fileInfo, media.metadata, fields]);

  useEffect(() => {
    messageHandler.request<UnmappedMedia[]>(DashboardMessage.getUnmappedMedia, media.filename).then((result) => {
      setUnmapped(result);
    });
  }, [media.filename]);

  return (
    <>
      <h3 className={`text-base text-[var(--vscode-editor-foreground)]`}>
        {l10n.t(LocalizationKey.dashboardMediaMetadataPanelTitle)}
      </h3>

      {
        unmapped && unmapped.length > 0 && (
          <div className="flex flex-col py-3 space-y-3">
            <p className={`text-sm my-3 font-medium text-[var(--vscode-editor-foreground)] opacity-90`}>
              {l10n.t(LocalizationKey.dashboardMediaDetailsSlideOverUnmappedDescription)}
            </p>
            <ul className='pl-4'>
              {
                unmapped.map((item) => (
                  <li className='list-disc'>
                    <button
                      key={item.file}
                      className='text-left hover:text-[var(--frontmatter-link-hover)]'
                      onClick={() => remapMetadata(item)}>
                      {item.file}{item.metadata.title ? ` (${item.metadata.title})` : ''}
                    </button>
                  </li>
                ))
              }
            </ul>
          </div>
        )
      }

      <p className={`text-sm my-3 font-medium text-[var(--vscode-editor-foreground)] opacity-90`}>
        {l10n.t(LocalizationKey.dashboardMediaMetadataPanelDescription)}
      </p>

      <div className="flex flex-col py-3 space-y-3">
        <div>
          <label className={`block text-sm font-medium text-[var(--vscode-editor-foreground)]`}>
            {l10n.t(LocalizationKey.dashboardMediaMetadataPanelFieldFileName)}
          </label>
          <div className="relative mt-1">
            <DetailsInput name={`filename`} value={fileInfo.name || ""} onChange={(e) => setFilename(`${e}.${fileInfo.extension}`)} />

            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className={`sm:text-sm placeholder-[var(--vscode-input-placeholderForeground)]`}>.{fileInfo?.extension}</span>
            </div>
          </div>
        </div>

        {formFields}
      </div>

      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className={`w-full inline-flex justify-center rounded border-transparent shadow-sm px-4 py-2 text-base font-medium sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-30 bg-[var(--frontmatter-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] text-[var(--vscode-button-foreground)] outline-[var(--vscode-focusBorder)] outline-1`}
          onClick={onSubmitMetadata}
          disabled={!filename}
        >
          {l10n.t(LocalizationKey.commonSave)}
        </button>
        <button
          type="button"
          className={`mt-3 w-full inline-flex justify-center rounded shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:mt-0 sm:w-auto sm:text-sm bg-[var(--vscode-button-secondaryBackground)] hover:bg-[var(--vscode-button-secondaryHoverBackground)] text-[var(--vscode-button-secondaryForeground)]`}
          onClick={onDismiss}
        >
          {l10n.t(LocalizationKey.commonCancel)}
        </button>
      </div>
    </>
  );
};