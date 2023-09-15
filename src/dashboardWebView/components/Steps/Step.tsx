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
          <div className="h-9 flex items-center" aria-hidden="true">
            <div
              className={`relative z-10 w-8 h-8 flex items-center justify-center border-2 rounded-full bg-[var(--frontmatter-border)] border-[var(--frontmatter-border)] ${onClick ? 'group-hover:text-[var(--vscode-button-foreground)] group-hover:border-[var(--vscode-button-hoverBackground)]' : ''
                }`}
            >
              <span
                className={`h-2.5 w-2.5 bg-transparent rounded-full ${onClick ? getColors('group-hover:bg-gray-400', 'group-hover:bg-[var(--vscode-button-hoverBackground)]') : ''
                  }`}
              />
            </div>
          </div>
        )}

        {status === Status.Active && (
          <div className="h-9 flex items-center" aria-hidden="true">
            <div className={`relative z-10 w-8 h-8 flex items-center justify-center border-2 rounded-full bg-[var(--frontmatter-border)] border-[var(--frontmatter-border)] group-hover:text-[var(--vscode-button-foreground)] group-hover:border-[var(--vscode-button-hoverBackground)]`}>
              <span className={`h-2.5 w-2.5 rounded-full ${getColors(
                'bg-teal-600',
                'bg-[var(--frontmatter-button-background)]'
              )
                }`} />
            </div>
          </div>
        )}

        {status === Status.Completed && (
          <div className="h-9 flex items-center">
            <div className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-[var(--vscode-button-foreground)] bg-[var(--frontmatter-button-background)] group-hover:bg-[var(--vscode-button-hoverBackground)]`}>
              <CheckIcon className={`w-5 h-5`} aria-hidden="true" />
            </div>
          </div>
        )}

        <div className={`ml-4 flex flex-col w-full`}>
          <div className={`text-xs font-semibold tracking-wide uppercase text-[var(--vscode-editor-foreground)]`}>
            {name}
          </div>
          <div className={`mt-1 text-sm text-[var(--vscode-editor-foreground)]`}>{description}</div>
        </div>
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
