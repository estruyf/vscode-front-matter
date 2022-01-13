import { ExclamationCircleIcon } from '@heroicons/react/outline';
import * as React from 'react';

export interface IEmptyViewProps {}

export const EmptyView: React.FunctionComponent<IEmptyViewProps> = (props: React.PropsWithChildren<IEmptyViewProps>) => {
  return (
    <div className='flex flex-col items-center justify-center w-full'>
      <ExclamationCircleIcon className={`w-1/12 text-gray-500 dark:text-whisper-900 opacity-90`} />
      <h2 className={`text-xl text-gray-500 dark:text-whisper-900`}>Select your date type first</h2>
    </div>
  );
};