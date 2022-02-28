import { Messenger } from '@estruyf/vscode/dist/client';
import {UploadIcon} from '@heroicons/react/outline';
import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { LoadingAtom, MediaFoldersAtom, SelectedMediaFolderAtom, SettingsSelector, ViewDataSelector } from '../../state';
import { Header } from '../Header';
import { Spinner } from '../Spinner';
import { SponsorMsg } from '../SponsorMsg';
import { Item } from './Item';
import { Lightbox } from './Lightbox';
import { List } from './List';
import { useDropzone } from 'react-dropzone'
import { useCallback, useEffect } from 'react';
import { DashboardMessage } from '../../DashboardMessage';
import { FrontMatterIcon } from '../../../panelWebView/components/Icons/FrontMatterIcon';
import { FolderItem } from './FolderItem';
import useMedia from '../../hooks/useMedia';
import { TelemetryEvent } from '../../../constants';

export interface IMediaProps {}

export const Media: React.FunctionComponent<IMediaProps> = (props: React.PropsWithChildren<IMediaProps>) => {
  const { media } = useMedia();
  const settings = useRecoilValue(SettingsSelector);
  const viewData = useRecoilValue(ViewDataSelector);
  const selectedFolder = useRecoilValue(SelectedMediaFolderAtom);
  const folders = useRecoilValue(MediaFoldersAtom);
  const loading = useRecoilValue(LoadingAtom);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        const contents = reader.result;
        Messenger.send(DashboardMessage.uploadMedia, {
          fileName: file.name,
          contents,
          folder: selectedFolder
        });
      };

      reader.readAsDataURL(file)
    });
  }, [selectedFolder]);

  useEffect(() => {
    Messenger.send(DashboardMessage.sendTelemetry, {
      event: TelemetryEvent.webviewMediaView
    });
  }, []);

  const {getRootProps, isDragActive} = useDropzone({
    onDrop,
    accept: 'image/*'
  });
  
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header settings={settings} />

      <div className="w-full flex-grow max-w-7xl mx-auto py-6 px-4" {...getRootProps()}>

        {
          viewData?.data?.filePath && (
            <div className={`text-lg text-center mb-6`}>
              <p>Select the image you want to use for your article.</p>
              <p className={`opacity-80 text-base`}>You can also drag and drop images from your desktop and select that once uploaded.</p>
            </div>
          )
        }
        
        {
          isDragActive && (
            <div className="absolute top-0 left-0 w-full h-full text-whisper-500 bg-gray-900 bg-opacity-70 flex flex-col justify-center items-center z-50">
              <UploadIcon className={`h-32`} />
              <p className={`text-xl max-w-md text-center`}>
                {selectedFolder ? `Upload to ${selectedFolder}` : `No folder selected, files you drop will be added to the ${settings?.staticFolder || "public"} folder.`}
              </p>
            </div>
          )
        }

        {
          (media.length === 0 && folders.length === 0 && !loading) && (
            <div className={`flex items-center justify-center h-full`}>
              <div className={`max-w-xl text-center`}>
                <FrontMatterIcon className={`text-vulcan-300 dark:text-whisper-800 h-32 mx-auto opacity-90 mb-8`} />
                
                <p className={`text-xl font-medium`}>No media files to show. You can drag &amp; drop new files.</p>
              </div>
            </div>
          )
        }

        {
          folders && folders.length > 0 && (
            <div className={`mb-8`}>
              <List gap={0}>
                {
                  folders && folders.map((folder) => (
                    <FolderItem key={folder} folder={folder} staticFolder={settings?.staticFolder} wsFolder={settings?.wsFolder} />
                  ))
                }
              </List>
            </div>
          )
        }

        <List>
          {
            media.map((file) => (
              <Item key={file.fsPath} media={file} />
            ))
          }
        </List>
      </div>

      {
        loading && ( <Spinner /> )
      }

      <Lightbox />

      <SponsorMsg beta={settings?.beta} version={settings?.versionInfo} isBacker={settings?.isBacker} />
    </div>
  );
};