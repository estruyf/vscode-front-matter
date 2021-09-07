import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { MediaInfo, MediaPaths } from '../../../models/MediaPaths';
import { DashboardCommand } from '../../DashboardCommand';
import { MediaFoldersAtom, MediaTotalAtom, SettingsSelector } from '../../state';
import { Header } from '../Header';
import { Item } from './Item';
import { List } from './List';

export interface IMediaProps {}

export const LIMIT = 16;

export const Media: React.FunctionComponent<IMediaProps> = (props: React.PropsWithChildren<IMediaProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const [ media, setMedia ] = React.useState<MediaInfo[]>([]);
  const [ , setTotal ] = useRecoilState(MediaTotalAtom);
  const [ , setFolders ] = useRecoilState(MediaFoldersAtom);

  React.useEffect(() => {
    Messenger.listen<MediaPaths>((message) => {
      if (message.command === DashboardCommand.media) {
        setMedia(message.data.media);
        setTotal(message.data.total);
        setFolders(message.data.folders);
      }
    });
  }, ['']);
  
  return (
    <main className={`h-full w-full`}>
      <div className="flex flex-col h-full overflow-auto">
        <Header settings={settings} />

        <div className="w-full max-w-7xl mx-auto py-6 px-4">
          <List>
            {
              media.map((file) => (
                <Item key={file.fsPath} media={file} />
              ))
            }
          </List>
        </div>
      </div>
    </main>
  );
};