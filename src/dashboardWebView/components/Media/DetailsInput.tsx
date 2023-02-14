import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';

export interface IDetailsInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isTextArea?: boolean;
}

export const DetailsInput: React.FunctionComponent<IDetailsInputProps> = ({ value, isTextArea, onChange }: React.PropsWithChildren<IDetailsInputProps>) => {
  const { getColors } = useThemeColors();

  if (isTextArea) {
    return (
      <textarea
        rows={3}
        className={`py-1 px-2 sm:text-sm border w-full ${
          getColors(
            'bg-white dark:bg-vulcan-300 border-gray-300 dark:border-vulcan-100 text-vulcan-500 dark:text-whisper-500 placeholder-gray-400 dark:placeholder-whisper-800 focus:outline-none',
            'bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border-[var(--vscode-editorWidget-border)] placeholder-[var(--vscode-input-placeholderForeground)] focus:outline-[var(--vscode-focusBorder)] focus:outline-1 focus:outline-offset-0 focus:shadow-none focus:border-transparent'
          )
        }`}
        value={value}
        onChange={onChange}
      />
    );
  }

  return (
    <input
      className={`py-1 px-2 sm:text-sm border w-full ${
        getColors(
          'bg-white dark:bg-vulcan-300 border-gray-300 dark:border-vulcan-100 text-vulcan-500 dark:text-whisper-500 placeholder-gray-400 dark:placeholder-whisper-800 focus:outline-none',
          'bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border-[var(--vscode-editorWidget-border)] placeholder-[var(--vscode-input-placeholderForeground)] focus:outline-[var(--vscode-focusBorder)] focus:outline-1 focus:outline-offset-0 focus:shadow-none focus:border-transparent'
        )
      }`}
      value={value}
      onChange={onChange}
    />
  );
};