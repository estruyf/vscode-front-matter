import * as React from 'react';

export interface ISpinnerProps {}

export const Spinner: React.FunctionComponent<ISpinnerProps> = (props: React.PropsWithChildren<ISpinnerProps>) => {
  return (
    <div className={`fixed top-0 left-0 right-0 bottom-0 w-full h-full flex flex-wrap items-center justify-center bg-white bg-opacity-10 z-50`}>
      <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-50 h-32 w-32" />
    </div>
  );
};