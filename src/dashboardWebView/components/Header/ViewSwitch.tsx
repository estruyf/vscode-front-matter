import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ViewAtom, SettingsSelector } from '../../state';
import { ViewListIcon, ViewGridIcon } from '@heroicons/react/solid';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { DashboardViewType } from '../../models';

export interface IViewSwitchProps {}

export const ViewSwitch: React.FunctionComponent<IViewSwitchProps> = (
  props: React.PropsWithChildren<IViewSwitchProps>
) => {
  const [view, setView] = useRecoilState(ViewAtom);
  const settings = useRecoilValue(SettingsSelector);

  const toggleView = () => {
    const newView =
      view === DashboardViewType.Grid ? DashboardViewType.List : DashboardViewType.Grid;
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
      <button
        className={`flex items-center px-2 py-1 rounded-l-sm ${
          view === DashboardViewType.Grid ? 'bg-teal-500 text-vulcan-500' : 'text-whisper-500'
        }`}
        onClick={toggleView}
      >
        <ViewGridIcon className={`w-4 h-4`} />
        <span className={`sr-only`}>Change to grid</span>
      </button>
      <button
        className={`flex items-center px-2 py-1 rounded-r-sm ${
          view === DashboardViewType.List ? 'bg-teal-500 text-vulcan-500' : 'text-whisper-500'
        }`}
        onClick={toggleView}
      >
        <ViewListIcon className={`w-4 h-4`} />
        <span className={`sr-only`}>Change to list</span>
      </button>
    </div>
  );
};
