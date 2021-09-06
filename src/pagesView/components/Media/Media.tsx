import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { MediaPaths } from '../../../models/MediaPaths';
import { DashboardCommand } from '../../DashboardCommand';
import { DashboardMessage } from '../../DashboardMessage';
import { SettingsSelector } from '../../state';
import { Header } from '../Header';

export interface IMediaProps {}

const LIMIT = 25;

export const Media: React.FunctionComponent<IMediaProps> = (props: React.PropsWithChildren<IMediaProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const [ media, setMedia ] = React.useState<MediaPaths[]>([]);
  const [ page, setPage ] = React.useState<number>(0);

  const crntMedia = media.splice(page * LIMIT, LIMIT);

  React.useEffect(() => {
    Messenger.send(DashboardMessage.getMedia);

    Messenger.listen<MediaPaths[]>((message) => {
      if (message.command === DashboardCommand.media) {
        setMedia(message.data);
        setPage(0);
      }
    });
  }, ['']);

  console.log(crntMedia)
  
  return (
    <main className={`h-full w-full`}>
      <div className="flex flex-col h-full overflow-auto">
        <Header settings={settings} />

        <div className="w-full max-w-7xl mx-auto py-6 px-4">
          {
            crntMedia.map((media) => (
              <div key={media.fsPath} className="flex flex-col items-center justify-center w-full h-64">
                <img src={media.vsPath} className="w-full h-full" />
              </div>
            ))
          }
        </div>
      </div>
    </main>
  );
};