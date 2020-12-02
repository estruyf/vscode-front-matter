import * as React from 'react';

export interface ISpinnerProps {}

export const Spinner: React.FunctionComponent<ISpinnerProps> = (props: React.PropsWithChildren<ISpinnerProps>) => {
  return (
    <div className="spinner">Loading...</div>
  );
};