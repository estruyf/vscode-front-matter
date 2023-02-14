import { ExclamationIcon } from '@heroicons/react/solid';
import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';

export interface IErrorViewProps {}

export const ErrorView: React.FunctionComponent<IErrorViewProps> = (
  props: React.PropsWithChildren<IErrorViewProps>
) => {
  const { getColors } = useThemeColors();
  
  return (
    <main className={`h-full w-full flex flex-col justify-center items-center space-y-2`}>
      <ExclamationIcon className={`w-24 h-24 ${getColors(`text-red-500`, `text-[var(--vscode-editorError-foreground)]`)}`} />
      <p className="text-xl">Sorry, something went wrong.</p>
      <p className="text-base">Please close the dashboard and try again.</p>
    </main>
  );
};
