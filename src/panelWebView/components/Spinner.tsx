import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export interface ISpinnerProps { }

const Spinner: React.FunctionComponent<ISpinnerProps> = (
  _: React.PropsWithChildren<ISpinnerProps>
) => {
  return (
    <div className="spinner">
      {l10n.t(LocalizationKey.panelSpinnerLoading)}
    </div>
  );
};

Spinner.displayName = 'Spinner';
export { Spinner };
