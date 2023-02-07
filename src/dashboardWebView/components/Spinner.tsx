import * as React from 'react';
import useThemeColors from '../hooks/useThemeColors';

export interface ISpinnerProps {}

export const Spinner: React.FunctionComponent<ISpinnerProps> = (
  props: React.PropsWithChildren<ISpinnerProps>
) => {
  const { getColors } = useThemeColors();
  
  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 w-full h-full flex flex-wrap items-center justify-center z-50 ${
        getColors(
          `bg-black bg-opacity-50`,
          `bg-[var(--vscode-editor-background)] opacity-75`
        )
      }`}
    >
      <div className={`loader ease-linear rounded-full border-8 border-t-8 h-16 w-16 ${
        getColors(`border-gray-50 border-t-teal-500`, `border-[var(--vscode-activityBar-inactiveForeground)] border-t-[var(--vscode-activityBarBadge-background)]`)
      }`} />
    </div>
  );
};
