import * as React from 'react';

export interface ISpinnerProps {}

const Spinner: React.FunctionComponent<ISpinnerProps> = (props: React.PropsWithChildren<ISpinnerProps>) => {
  return (
    <div className="spinner">Loading...</div>
  );
};

Spinner.displayName = 'Spinner';
export { Spinner };