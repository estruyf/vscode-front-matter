import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { QuickAction } from '../Menu';
import { EyeIcon, GlobeEuropeAfricaIcon, TrashIcon } from '@heroicons/react/24/outline';
import { LocalizationKey } from '../../../localization';
import { openFile, openOnWebsite } from '../../utils';
import { useRecoilState } from 'recoil';
import { SelectedItemActionAtom } from '../../state';

export interface IFooterActionsProps {
  filePath: string;
  websiteUrl?: string;
}

export const FooterActions: React.FunctionComponent<IFooterActionsProps> = ({
  filePath,
  websiteUrl
}: React.PropsWithChildren<IFooterActionsProps>) => {
  const [, setSelectedItemAction] = useRecoilState(SelectedItemActionAtom);

  return (
    <div className={`py-2 w-full flex items-center justify-evenly border-t border-t-[var(--frontmatter-border)]`}>
      <QuickAction
        title={l10n.t(LocalizationKey.dashboardContentsContentActionsMenuItemView)}
        className={`text-[var(--frontmatter-secondary-text)]`}
        onClick={() => openFile(filePath)}>
        <EyeIcon className={`w-4 h-4`} aria-hidden="true" />
      </QuickAction>

      {
        websiteUrl && (
          <QuickAction
            title={l10n.t(LocalizationKey.commonOpenOnWebsite)}
            className={`text-[var(--frontmatter-secondary-text)]`}
            onClick={() => openOnWebsite(websiteUrl, filePath)}>
            <GlobeEuropeAfricaIcon className={`w-4 h-4`} aria-hidden="true" />
          </QuickAction>
        )
      }

      <QuickAction
        title={l10n.t(LocalizationKey.commonDelete)}
        className={`text-[var(--frontmatter-secondary-text)] hover:text-[var(--vscode-statusBarItem-errorBackground)]`}
        onClick={() => setSelectedItemAction({ path: filePath, action: 'delete' })}>
        <TrashIcon className={`w-4 h-4`} aria-hidden="true" />
      </QuickAction>
    </div>
  );
};