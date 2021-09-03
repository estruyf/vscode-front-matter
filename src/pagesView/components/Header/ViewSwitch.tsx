import * as React from 'react';
import { useRecoilState } from 'recoil';
import { ViewAtom, ViewType } from '../../state';
import { ViewGridIcon, ViewListIcon } from '@heroicons/react/solid';
import { STORAGE_VIEW_TYPE } from '../../constants/Storage';

export interface IViewSwitchProps {}

export const ViewSwitch: React.FunctionComponent<IViewSwitchProps> = (props: React.PropsWithChildren<IViewSwitchProps>) => {
  const [ view, setView ] = useRecoilState(ViewAtom);

  const toggleView = () => {
    const newView = view === ViewType.Grid ? ViewType.List : ViewType.Grid;
    window.localStorage.setItem(STORAGE_VIEW_TYPE, newView.toString());
    setView(newView);
  };

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