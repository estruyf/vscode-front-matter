import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ViewAtom, SettingsSelector } from '../../state';
import { Bars4Icon, Squares2X2Icon } from '@heroicons/react/24/solid';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { DashboardViewType } from '../../models';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IViewSwitchProps { }

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
    <div className={`flex rounded-sm lg:mb-1 bg-[var(--vscode-button-secondaryBackground)]`}>
      <button
        className={`flex items-center px-2 py-1 rounded-l-sm ${view === DashboardViewType.Grid ? `bg-[var(--frontmatter-button-background)] text-[var(--vscode-button-foreground)]` : 'text-[var(--vscode-button-secondaryForeground)] hover:bg-[var(--vscode-button-secondaryHoverBackground)]'
          }`}
        title={l10n.t(LocalizationKey.dashboardHeaderViewSwitchToGrid)}
        type={`button`}
        onClick={toggleView}
      >
        <Squares2X2Icon className={`w-4 h-4`} />
        <span className={`sr-only`}>
          {l10n.t(LocalizationKey.dashboardHeaderViewSwitchToGrid)}
        </span>
      </button>
      <button
        className={`flex items-center px-2 py-1 rounded-r-sm ${view === DashboardViewType.List ? `bg-[var(--frontmatter-button-background)] text-[var(--vscode-button-foreground)]` : 'text-[var(--vscode-button-secondaryForeground)] hover:bg-[var(--vscode-button-secondaryHoverBackground)]'
          }`}
        title={l10n.t(LocalizationKey.dashboardHeaderViewSwitchToList)}
        type={`button`}
        onClick={toggleView}
      >
        <Bars4Icon className={`w-4 h-4`} />
        <span className={`sr-only`}>
          {l10n.t(LocalizationKey.dashboardHeaderViewSwitchToList)}
        </span>
      </button>
    </div>
  );
};
