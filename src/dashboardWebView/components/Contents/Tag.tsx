import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { routePaths } from '../..';
import { LocalizationKey } from '../../../localization';
import { useNavigate } from 'react-router-dom';

export interface ITagProps {
  value?: string;
  tagField?: string | null | undefined;
}

export const Tag: React.FunctionComponent<ITagProps> = ({
  value,
  tagField
}: React.PropsWithChildren<ITagProps>) => {
  const navigate = useNavigate();

  if (!value) {
    return null;
  }

  return (
    <button
      className={`inline-block mr-1 mt-1 text-xs text-[var(--vscode-button-secondaryForeground)] bg-[var(--vscode-button-secondaryBackground)] hover:bg-[var(--vscode-button-secondaryHoverBackground)] border border-[var(--frontmatter-border)] rounded px-1 py-0.5`}
      title={l10n.t(LocalizationKey.commonFilterValue, value)}
      onClick={() => {
        if (tagField) {
          navigate(`${routePaths.contents}?taxonomy=${tagField}&value=${value}`);
        }
      }}
    >
      #{value}
    </button>
  );
};