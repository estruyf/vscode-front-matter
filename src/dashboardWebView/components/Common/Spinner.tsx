import * as React from 'react';
import { LoadingType } from '../../../models';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface ISpinnerProps {
  type?: LoadingType;
}

export const Spinner: React.FunctionComponent<ISpinnerProps> = (
  { type }: React.PropsWithChildren<ISpinnerProps>
) => {
  return (
    <div className={`z-50 fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-[var(--vscode-editor-background)] opacity-75`}>
      <div
        className={`absolute top-0 w-full h-[2px] `}
      >
        <div className={`h-full absolute rounded-sm bg-[var(--vscode-activityBarBadge-background)] animate-[vscode-loader_4s_ease-in-out_infinite]`} />
      </div>

      {
        type === 'initPages' && (
          <div className='spinner-msg h-full text-2xl flex justify-center items-center text-[var(--vscode-foreground)]'>
            <span>{l10n.t(LocalizationKey.loadingInitPages)}</span>
            <span className='dots'></span>
          </div>
        )
      }
    </div>
  );
};