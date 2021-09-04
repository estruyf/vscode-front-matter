import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ViewAtom, ViewType } from '../../state';
import { ViewGridIcon, ViewListIcon } from '@heroicons/react/solid';
import { SettingsAtom } from '../../state/atom/SettingsAtom';
import { MessageHelper } from '../../../helpers/MessageHelper';
import { DashboardMessage } from '../../DashboardMessage';

export interface IViewSwitchProps {}

export const ViewSwitch: React.FunctionComponent<IViewSwitchProps> = (props: React.PropsWithChildren<IViewSwitchProps>) => {
  const [ view, setView ] = useRecoilState(ViewAtom);
  const settings = useRecoilValue(SettingsAtom);
  
  const toggleView = () => {
    const newView = view === ViewType.Grid ? ViewType.List : ViewType.Grid;
    setView(newView);
    MessageHelper.sendMessage(DashboardMessage.setPageViewType, newView);
  };

  React.useEffect(() => {
    if (settings?.pageViewType) {
      setView(settings?.pageViewType);
    }
  }, [settings?.pageViewType]);

  return (
    <div className={`flex rounded-sm bg-vulcan-50 lg:mb-1`}>
      <button className={`flex items-center p-2 rounded-l-sm ${view === ViewType.Grid ? 'bg-teal-500 text-vulcan-500' : 'text-whisper-500'}`} onClick={toggleView}>
        <ViewGridIcon className={`w-4 h-4`} />
        <span className={`sr-only`}>Change to grid</span>
      </button>
      <button className={`flex items-center p-2 rounded-r-sm ${view === ViewType.List ? 'bg-teal-500 text-vulcan-500' : 'text-whisper-500'}`} onClick={toggleView}>
        <ViewListIcon className={`w-4 h-4`} />
        <span className={`sr-only`}>Change to list</span>
      </button>
    </div>
  );
};