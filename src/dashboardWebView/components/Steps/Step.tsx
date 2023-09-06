import { CheckIcon } from '@heroicons/react/outline';
import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';
import { Status } from '../../models/Status';

export interface IStepProps {
  name: string;
  description: JSX.Element;
  status: Status;
  showLine: boolean;
  onClick?: () => void | undefined;
}

export const Step: React.FunctionComponent<IStepProps> = ({
  name,
  description,
  status,
  showLine,
  onClick
}: React.PropsWithChildren<IStepProps>) => {
  const { getColors } = useThemeColors();

  const renderChildren = () => {
    return (
      <>
        {status === Status.NotStarted && (
          <span className="h-9 flex items-center" aria-hidden="true">
            <span
              className={`relative z-10 w-8 h-8 flex items-center justify-center border-2 rounded-full ${getColors(
                'bg-white border-gray-300',
                'bg-[var(--frontmatter-border-noOpacity)] border-[var(--frontmatter-border)]'
              )
                } ${onClick ? getColors('group-hover:text-gray-400', 'group-hover:text-[var(--vscode-button-foreground)] group-hover:border-[var(--vscode-button-hoverBackground)]') : ''
                }`}
            >
              <span
                className={`h-2.5 w-2.5 bg-transparent rounded-full ${onClick ? getColors('group-hover:bg-gray-400', 'group-hover:bg-[var(--vscode-button-hoverBackground)]') : ''
                  }`}
              />
            </span>
          </span>
        )}

        {status === Status.Active && (
          <span className="h-9 flex items-center" aria-hidden="true">
            <span className={`relative z-10 w-8 h-8 flex items-center justify-center border-2 rounded-full ${getColors(
              'bg-white border-teal-600',
              'bg-[var(--frontmatter-border)] border-[var(--frontmatter-border)] group-hover:text-[var(--vscode-button-foreground)] group-hover:border-[var(--vscode-button-hoverBackground)]'
            )
              }`}>
              <span className={`h-2.5 w-2.5 rounded-full ${getColors(
                'bg-teal-600',
                'bg-[var(--frontmatter-button-background)]'
              )
                }`} />
            </span>
          </span>
        )}

        {status === Status.Completed && (
          <span className="h-9 flex items-center">
            <span className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full ${getColors(
              'bg-teal-600 group-hover:bg-teal-800',
              'text-[var(--vscode-button-foreground)] bg-[var(--frontmatter-button-background)] group-hover:bg-[var(--vscode-button-hoverBackground)]'
            )
              }`}>
              <CheckIcon className={`w-5 h-5 ${getColors('text-white', '')}`} aria-hidden="true" />
            </span>
          </span>
        )}

        <span className={`ml-4 min-w-0 flex flex-col`}>
          <span className={`text-xs font-semibold tracking-wide uppercase ${getColors(
            'text-vulcan-500 dark:text-whisper-500',
            'text-[var(--vscode-editor-foreground)]'
          )
            }`}>
            {name}
          </span>
          <div className={`mt-1 text-sm ${getColors(
            'text-vulcan-400 dark:text-whisper-600',
            'text-[var(--vscode-editor-foreground)]'
          )
            }`}>{description}</div>
        </span>
      </>
    );
  };

  return (
    <>
      {showLine ? (
        <div
          className={`-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full ${status === Status.Completed ? getColors('bg-teal-600', 'bg-[var(--frontmatter-button-background)]') : getColors('bg-gray-300', 'bg-[var(--frontmatter-border)]')
            }`}
          aria-hidden="true"
        />
      ) : null}

      {onClick ? (
        <button
          className={`relative flex items-start group text-left`}
          onClick={() => {
            if (onClick) {
              onClick();
            }
          }}
          disabled={!onClick}
        >
          {renderChildren()}
        </button>
      ) : (
        <div className="relative flex items-start group text-left">
          {renderChildren()}
        </div>
      )}
    </>
  );
};
