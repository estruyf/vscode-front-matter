import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';

export interface IDetailsItemProps {
  title: string;
  details: string;
}

export const DetailsItem: React.FunctionComponent<IDetailsItemProps> = ({ title, details }: React.PropsWithChildren<IDetailsItemProps>) => {
  const { getColors } = useThemeColors();

  return (
    <>
      <div className="py-3 flex justify-between text-sm font-medium">
        <dt className={getColors('text-vulcan-100 dark:text-whisper-900', 'text-[var(--vscode-editor-foreground)]')}>{title}</dt>
        <dd className={`text-right ${getColors('text-vulcan-300 dark:text-whisper-500', 'text-[var(--vscode-foreground)]')}`}>
          {details}
        </dd>
      </div>
    </>
  );
};