import { Messenger } from '@estruyf/vscode/dist/client';
import { EventData } from '@estruyf/vscode/dist/models';
import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { MediaInfo, MediaPaths } from '../../../models/MediaPaths';
import { DashboardCommand } from '../../DashboardCommand';
import { LoadingAtom, MediaFoldersAtom, MediaTotalAtom, SettingsSelector } from '../../state';
import { Header } from '../Header';
import { Spinner } from '../Spinner';
import { SponsorMsg } from '../SponsorMsg';
import { Item } from './Item';
import { Lightbox } from './Lightbox';
import { List } from './List';

export interface IMediaProps {}

export const LIMIT = 16;

export const Media: React.FunctionComponent<IMediaProps> = (props: React.PropsWithChildren<IMediaProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const [ media, setMedia ] = React.useState<MediaInfo[]>([]);
  const [ , setTotal ] = useRecoilState(MediaTotalAtom);
  const [ , setFolders ] = useRecoilState(MediaFoldersAtom);
  const [ loading, setLoading ] = useRecoilState(LoadingAtom);

  const messageListener = (message: MessageEvent<EventData<MediaPaths>>) => {
    if (message.data.command === DashboardCommand.media) {
      setLoading(false);
      setMedia(message.data.data.media);
      setTotal(message.data.data.total);
      setFolders(message.data.data.folders);
    }
  }

  React.useEffect(() => {
    Messenger.listen<MediaPaths>(messageListener);

    return () => {
      Messenger.unlisten(messageListener);
    }
  }, ['']);
  
  return (
    <main className={`h-full w-full`}>
      <div className="flex flex-col h-full overflow-auto">
        <Header settings={settings} />

        <div className="w-full flex-grow max-w-7xl mx-auto py-6 px-4">
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

        <SponsorMsg beta={settings?.beta} version={settings?.versionInfo} />
      </div>
    </main>
  );
};