import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { QuickAction } from '../Menu';
import { EyeIcon, GlobeEuropeAfricaIcon, TrashIcon } from '@heroicons/react/24/solid';
import { LocalizationKey } from '../../../localization';
import { openFile, openOnWebsite } from '../../utils';
import { useSetRecoilState } from 'recoil';
import { SelectedItemActionAtom } from '../../state';
import { CustomScript } from '../../../models';
import { CustomActions } from './CustomActions';

export interface IFooterActionsProps {
  filePath: string;
  contentType: string;
  websiteUrl?: string;
  scripts?: CustomScript[];
  /** Render as an inline icon row without the full-width wrapper bar */
  compact?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
}

export const FooterActions: React.FunctionComponent<IFooterActionsProps> = ({
  filePath,
  contentType,
  websiteUrl,
  scripts,
  compact,
  onMenuOpenChange,
}: React.PropsWithChildren<IFooterActionsProps>) => {
  const setSelectedItemAction = useSetRecoilState(SelectedItemActionAtom);

  const actions = (
    <>
      <QuickAction
        title={l10n.t(LocalizationKey.dashboardContentsContentActionsMenuItemView)}
        className={`text-[var(--fm-text-lo)] hover:text-[var(--fm-text-mid)]`}
        onClick={() => openFile(filePath)}
      >
        <span className={`sr-only`}>{l10n.t(LocalizationKey.dashboardContentsContentActionsMenuItemView)}</span>
        <EyeIcon className={`w-3.5 h-3.5`} aria-hidden="true" />
      </QuickAction>

      {websiteUrl && (
        <QuickAction
          title={l10n.t(LocalizationKey.commonOpenOnWebsite)}
          className={`text-[var(--fm-text-lo)] hover:text-[var(--fm-text-mid)]`}
          onClick={() => openOnWebsite(websiteUrl, filePath)}
        >
          <span className={`sr-only`}>{l10n.t(LocalizationKey.commonOpenOnWebsite)}</span>
          <GlobeEuropeAfricaIcon className={`w-3.5 h-3.5`} aria-hidden="true" />
        </QuickAction>
      )}

      <CustomActions
        filePath={filePath}
        contentType={contentType}
        scripts={scripts}
        showTrigger
        onMenuOpenChange={onMenuOpenChange}
      />

      <QuickAction
        title={l10n.t(LocalizationKey.commonDelete)}
        className={`text-[var(--fm-text-lo)] hover:text-[var(--fm-status-danger)]`}
        onClick={() => setSelectedItemAction({ path: filePath, action: 'delete' })}
      >
        <span className={`sr-only`}>{l10n.t(LocalizationKey.commonDelete)}</span>
        <TrashIcon className={`w-3.5 h-3.5`} aria-hidden="true" />
      </QuickAction>
    </>
  );

  if (compact) {
    return (
      <div className={`flex items-center gap-0.5`}>
        {actions}
      </div>
    );
  }

  return (
    <div className={`py-2 w-full flex items-center justify-evenly border-t border-t-[var(--frontmatter-border)] bg-[var(--frontmatter-sideBar-background)] group-hover:bg-[var(--vscode-list-hoverBackground)] rounded-b`}>
      {actions}
    </div>
  );
};
