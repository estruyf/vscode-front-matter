import * as React from 'react';

export interface ISpinnerProps { }

const Spinner: React.FunctionComponent<ISpinnerProps> = () => {
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
