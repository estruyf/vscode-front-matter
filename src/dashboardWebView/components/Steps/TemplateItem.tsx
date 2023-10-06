import { UserIcon } from '@heroicons/react/outline';
import { PuzzleIcon } from '@heroicons/react/solid';
import * as React from 'react';

export interface ITemplateItemProps {
  title: string;
  description: string;
  author: string;
  version: string;
  buttonTitle: string;
  onClick: () => void;
}

export const TemplateItem: React.FunctionComponent<ITemplateItemProps> = ({
  title,
  description,
  author,
  version,
  buttonTitle,
  onClick,
}: React.PropsWithChildren<ITemplateItemProps>) => {
  return (
    <button
      type='button'
      onClick={onClick}
      title={buttonTitle}
      className='relative p-2 text-left space-y-2 rounded flex flex-col bg-[var(--vscode-sideBar-background)] hover:bg-[var(--vscode-list-hoverBackground)] text-[var(--vscode-editor-foreground)] border border-[var(--frontmatter-border)]'>
      <h2 className='text-base'>{title}</h2>
      <p className='text-sm'>{description}</p>
      <div className='text-xs flex justify-between items-center w-full opacity-75'>
        <span className='inline-flex items-center gap-1'><UserIcon className='inline w-3 h-3' /> {author}</span>
        <span>v{version}</span>
      </div>

      <PuzzleIcon className='absolute top-0 right-2 h-8 w-8 opacity-25' />
    </button>
  );
};