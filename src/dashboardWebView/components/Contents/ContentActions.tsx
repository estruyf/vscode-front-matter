import { messageHandler } from '@estruyf/vscode/dist/client';
import { EyeIcon, GlobeEuropeAfricaIcon, TrashIcon, LanguageIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { CustomScript, I18nConfig } from '../../../models';
import { DashboardMessage } from '../../DashboardMessage';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SelectedItemActionAtom, SettingsSelector } from '../../state';
import { COMMAND_NAME, GeneralCommands } from '../../../constants';
import { PinIcon } from '../Icons/PinIcon';
import { PinnedItemsAtom } from '../../state/atom/PinnedItems';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/shadcn/Dropdown';
import { RenameIcon } from '../../../components/icons/RenameIcon';
import { openOnWebsite } from '../../utils';
import { CustomActions } from './CustomActions';
import { TranslationMenu } from './TranslationMenu';

export interface IContentActionsProps {
  path: string;
  relPath: string;
  contentType: string;
  scripts: CustomScript[] | undefined;
  listView?: boolean;
  locale?: I18nConfig;
  isDefaultLocale?: boolean;
  translations?: {
    [locale: string]: {
      locale: I18nConfig;
      path: string;
    };
  };
  onOpen: () => void;
}

export const ContentActions: React.FunctionComponent<IContentActionsProps> = ({
  path,
  relPath,
  contentType,
  scripts,
  onOpen,
  listView,
  isDefaultLocale,
  translations,
  locale
}: React.PropsWithChildren<IContentActionsProps>) => {
  const [, setSelectedItemAction] = useRecoilState(SelectedItemActionAtom);
  const [pinnedItems, setPinnedItems] = useRecoilState(PinnedItemsAtom);
  const settings = useRecoilValue(SettingsSelector);

  const onView = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    onOpen();
  };

  const onDelete = React.useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    setSelectedItemAction({ path, action: 'delete' });
  }, [path]);

  const onRename = React.useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    messageHandler.send(DashboardMessage.rename, path);
  }, [path])

  const onOpenWebsite = React.useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    openOnWebsite(settings?.websiteUrl, path);
  }, [settings?.websiteUrl, path]);

  const pinItem = React.useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    messageHandler.request<string[]>(DashboardMessage.pinItem, path).then((result) => {
      setPinnedItems(result || []);
    })
  }, [path]);

  const unpinItem = React.useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    messageHandler.request<string[]>(DashboardMessage.unpinItem, path).then((result) => {
      setPinnedItems(result || []);
    })
  }, [path]);

  const runCommand = React.useCallback((commandId: string) => {
    messageHandler.send(GeneralCommands.toVSCode.runCommand, {
      command: commandId,
      args: path
    })
  }, [path]);

  const isPinned = React.useMemo(() => {
    return pinnedItems.includes(relPath);
  }, [pinnedItems, relPath]);

  return (
    <>
      <div
        className={`${listView ? '' : 'group/card absolute top-6 right-2'
          } flex flex-col space-y-4`}
      >
        <div
          className={`flex items-center border border-transparent rounded-full ${listView ? '' : 'p-1 -mt-3'
            } group-hover/card:bg-[var(--vscode-sideBar-background)] group-hover/card:border-[var(--frontmatter-border)]`}
        >
          <div className={`relative flex text-left`}>
            <DropdownMenu>
              <DropdownMenuTrigger
                className='text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-tab-activeForeground)] data-[state=open]:text-[var(--vscode-tab-activeForeground)] focus:outline-none'>
                <span className="sr-only">{l10n.t(LocalizationKey.dashboardContentsContentActionsActionMenuButtonTitle)}</span>
                <EllipsisHorizontalIcon className="w-4 h-4" aria-hidden="true" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => isPinned ? unpinItem(e) : pinItem(e)}>
                  <PinIcon className={`mr-2 h-4 w-4 ${isPinned ? "" : "-rotate-90"}`} aria-hidden={true} />
                  <span>{isPinned ? l10n.t(LocalizationKey.commonUnpin) : l10n.t(LocalizationKey.commonPin)}</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onView}>
                  <EyeIcon className={`mr-2 h-4 w-4`} aria-hidden={true} />
                  <span>{l10n.t(LocalizationKey.dashboardContentsContentActionsMenuItemView)}</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onRename}>
                  <RenameIcon className={`mr-2 h-4 w-4`} aria-hidden={true} />
                  <span>{l10n.t(LocalizationKey.commonRename)}</span>
                </DropdownMenuItem>

                {
                  settings?.websiteUrl && (
                    <DropdownMenuItem onClick={onOpenWebsite}>
                      <GlobeEuropeAfricaIcon className={`mr-2 h-4 w-4`} aria-hidden={true} />
                      <span>{l10n.t(LocalizationKey.commonOpenOnWebsite)}</span>
                    </DropdownMenuItem>
                  )
                }

                {
                  locale && (
                    <DropdownMenuItem onClick={() => runCommand(COMMAND_NAME.i18n.create)}>
                      <LanguageIcon className={`mr-2 h-4 w-4`} aria-hidden={true} />
                      <span>{l10n.t(LocalizationKey.dashboardContentsContentActionsTranslationsCreate)}</span>
                    </DropdownMenuItem>
                  )
                }

                <TranslationMenu
                  isDefaultLocale={isDefaultLocale}
                  locale={locale}
                  translations={translations} />

                <CustomActions
                  filePath={path}
                  contentType={contentType}
                  scripts={scripts} />

                <DropdownMenuItem onClick={onDelete} className={`focus:bg-[var(--vscode-statusBarItem-errorBackground)] focus:text-[var(--vscode-statusBarItem-errorForeground)]`}>
                  <TrashIcon className={`mr-2 h-4 w-4`} aria-hidden={true} />
                  <span>{l10n.t(LocalizationKey.commonDelete)}</span>
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
};
