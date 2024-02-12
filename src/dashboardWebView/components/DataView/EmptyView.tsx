import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IEmptyViewProps { }

export const EmptyView: React.FunctionComponent<IEmptyViewProps> = (
  props: React.PropsWithChildren<IEmptyViewProps>
) => {

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <ExclamationCircleIcon className={`w-1/12 opacity-90 text-[var(--frontmatter-secondary-text)]`} />
      <h2 className={`text-xl text-[var(--frontmatter-secondary-text)]`}>
        {l10n.t(LocalizationKey.dashboardDataViewEmptyViewHeading)}
      </h2>
    </div>
  );
};
