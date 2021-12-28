import * as React from 'react';

export interface IQuickActionProps {
  title: string;
  onClick: () => void;
}

export const QuickAction: React.FunctionComponent<IQuickActionProps> = ({title, onClick, children}: React.PropsWithChildren<IQuickActionProps>) => {
  return (    
    <button
      type='button'
      title={title}
      onClick={onClick}
      className={`px-2 group inline-flex justify-center text-sm font-medium text-vulcan-400 hover:text-vulcan-600 dark:text-gray-400 dark:hover:text-whisper-600`}>
      {children}
      <span className='sr-only'>{title}</span>
    </button>
  );
};