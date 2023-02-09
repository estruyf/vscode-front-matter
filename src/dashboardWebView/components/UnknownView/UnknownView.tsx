import { StopIcon } from '@heroicons/react/outline';
import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';

export interface IUnknownViewProps { }

export const UnknownView: React.FunctionComponent<IUnknownViewProps> = (
  props: React.PropsWithChildren<IUnknownViewProps>
) => {
  const { getColors } = useThemeColors();

  return (
    <div className={`w-full h-full flex items-center justify-center`}>
      <div className={`flex flex-col items-center ${getColors(`text-gray-500 dark:text-whisper-900`, `text-[var(--frontmatter-text)]`)}`}>
        <StopIcon className="w-32 h-32" />
        <p className="text-3xl mt-2">View does not exist</p>
        <p className="text-xl mt-4">
          You seem to have ended up on a view that doesn't exist. Please re-open the dashboard.
        </p>
      </div>
    </div>
  );
};
