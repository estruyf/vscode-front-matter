import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ViewAtom, ViewType, SettingsSelector } from '../../state';
import { ViewGridIcon, ViewListIcon } from '@heroicons/react/solid';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';

export interface IViewSwitchProps {}

export const ViewSwitch: React.FunctionComponent<IViewSwitchProps> = (props: React.PropsWithChildren<IViewSwitchProps>) => {
  const [ view, setView ] = useRecoilState(ViewAtom);
  const settings = useRecoilValue(SettingsSelector);
  
  const toggleView = () => {
    const newView = view === ViewType.Grid ? ViewType.List : ViewType.Grid;
    setView(newView);
    Messenger.send(DashboardMessage.setPageViewType, newView);
  };

  React.useEffect(() => {
    if (settings?.pageViewType) {
      setView(settings?.pageViewType);
    }
  }, [settings?.pageViewType]);

  return (
    <div className={`flex rounded-sm bg-vulcan-50 lg:mb-1`}>
      <button className={`flex items-center px-2 py-1 rounded-l-sm ${view === ViewType.Grid ? 'bg-teal-500 text-vulcan-500' : 'text-whisper-500'}`} onClick={toggleView}>
        <ViewGridIcon className={`w-4 h-4`} />
        <span className={`sr-only`}>Change to grid</span>
      </button>
      <button className={`flex items-center px-2 py-1 rounded-r-sm ${view === ViewType.List ? 'bg-teal-500 text-vulcan-500' : 'text-whisper-500'}`} onClick={toggleView}>
        <ViewListIcon className={`w-4 h-4`} />
        <span className={`sr-only`}>Change to list</span>
      </button>
    </div>
  );
};