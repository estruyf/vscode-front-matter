import { ExclamationIcon } from '@heroicons/react/solid';
import * as React from 'react';

export interface IErrorViewProps {}

export const ErrorView: React.FunctionComponent<IErrorViewProps> = (props: React.PropsWithChildren<IErrorViewProps>) => {
  return (
    <main className={`h-full w-full flex flex-col justify-center items-center space-y-2`}>
      <ExclamationIcon className="w-24 h-24 text-red-500" />
      <p className='text-xl'>Sorry, something went wrong.</p>
      <p className='text-base'>Please close the dashboard and try again.</p>
    </main>
  );
};