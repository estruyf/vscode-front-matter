import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export interface ISpinnerProps { }

const Spinner: React.FunctionComponent<ISpinnerProps> = (
  _: React.PropsWithChildren<ISpinnerProps>
) => {
  return (
    <div className="vscode__loader">
      <div className="vscode__loader__bar">
        <div className="vscode__loader__bar__animation"></div>
      </div>
    </div>
  );
};

Spinner.displayName = 'Spinner';
export { Spinner };
