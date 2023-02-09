import { ExclamationCircleIcon } from '@heroicons/react/outline';
import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';

export interface IEmptyViewProps { }

export const EmptyView: React.FunctionComponent<IEmptyViewProps> = (
  props: React.PropsWithChildren<IEmptyViewProps>
) => {
  const { getColors } = useThemeColors();

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <ExclamationCircleIcon className={`w-1/12 opacity-90 ${getColors(`text-gray-500 dark:text-whisper-900`, `text-[var(--frontmatter-secondary-text)]`)}`} />
      <h2 className={`text-xl ${getColors(`text-gray-500 dark:text-whisper-900`, `text-[var(--frontmatter-secondary-text)]`)}`}>Select your date type first</h2>
    </div>
  );
};
