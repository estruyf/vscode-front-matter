import { messageHandler } from '@estruyf/vscode/dist/client';
import {
  EyeIcon,
  GlobeEuropeAfricaIcon,
  TrashIcon,
  LanguageIcon,
  EllipsisHorizontalIcon,
  ArrowRightCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import * as React from 'react';
import { CustomScript, I18nConfig } from '../../../models';
import { DashboardMessage } from '../../DashboardMessage';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { SelectedItemActionAtom, SettingsSelector } from '../../state';
import { COMMAND_NAME, GeneralCommands } from '../../../constants';
import { PinIcon } from '../Icons/PinIcon';
import { PinnedItemsAtom } from '../../state/atom/PinnedItems';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../components/shadcn/Dropdown';
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
  onMenuOpenChange?: (open: boolean) => void;
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
  locale,
  onMenuOpenChange
}: React.PropsWithChildren<IContentActionsProps>) => {
  const setSelectedItemAction = useSetRecoilState(SelectedItemActionAtom);
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

  const onMove = React.useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    setSelectedItemAction({ path, action: 'move' });
  }, [path]);

  const onRename = React.useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    messageHandler.send(DashboardMessage.rename, path);
  }, [path]);

  const onSmartRename = React.useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    messageHandler.send(DashboardMessage.smartRename, path);
  }, [path]);

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
        className={`${listView ? '' : 'group/card absolute top-2 right-2 z-10'} flex`}
      >
        <DropdownMenu onOpenChange={onMenuOpenChange}>
          <DropdownMenuTrigger
            className={`relative flex h-8 w-8 items-center justify-center rounded-[8px] border transition-colors focus:outline-none ${listView
              ? 'border-transparent text-[var(--fm-text-lo)] bg-transparent hover:bg-[var(--fm-surface-3)] hover:text-[var(--fm-text-mid)]'
              : 'border-[var(--fm-border)] text-[var(--fm-border)] bg-[var(--fm-surface-2)]/95 backdrop-blur-sm hover:bg-[var(--fm-surface-3)] hover:text-[var(--fm-text-hi)]'
              } data-[state=open]:text-[var(--fm-text-hi)] data-[state=open]:bg-[var(--fm-surface-3)]`}
          >
            <span className="sr-only">{l10n.t(LocalizationKey.dashboardContentsContentActionsActionMenuButtonTitle)}</span>
            <EllipsisHorizontalIcon className="w-4 h-4" aria-hidden="true" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => isPinned ? unpinItem(e) : pinItem(e)}>
              <PinIcon className={`h-4 w-4 ${isPinned ? "" : "-rotate-90"}`} aria-hidden={true} />
              <span>{isPinned ? l10n.t(LocalizationKey.commonUnpin) : l10n.t(LocalizationKey.commonPin)}</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onView}>
              <EyeIcon className={`h-4 w-4`} aria-hidden={true} />
              <span>{l10n.t(LocalizationKey.dashboardContentsContentActionsMenuItemView)}</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onMove}>
              <ArrowRightCircleIcon className={`h-4 w-4`} aria-hidden={true} />
              <span>Move to folder</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onRename}>
              <RenameIcon className={`h-4 w-4`} aria-hidden={true} />
              <span>{l10n.t(LocalizationKey.commonRename)}</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onSmartRename}>
              <ArrowPathIcon className={`h-4 w-4`} aria-hidden={true} />
              <span>{l10n.t(LocalizationKey.dashboardContentsContentActionsMenuItemSmartRename)}</span>
            </DropdownMenuItem>

            {
              settings?.websiteUrl && (
                <DropdownMenuItem onClick={onOpenWebsite}>
                  <GlobeEuropeAfricaIcon className={`h-4 w-4`} aria-hidden={true} />
                  <span>{l10n.t(LocalizationKey.commonOpenOnWebsite)}</span>
                </DropdownMenuItem>
              )
            }

            {
              locale && (
                <DropdownMenuItem onClick={() => runCommand(COMMAND_NAME.i18n.create)}>
                  <LanguageIcon className={`h-4 w-4`} aria-hidden={true} />
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

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={onDelete}
              className="text-[var(--fm-status-danger)] focus:bg-[var(--vscode-statusBarItem-errorBackground)] focus:text-[var(--vscode-statusBarItem-errorForeground)]"
            >
              <TrashIcon className={`h-4 w-4`} aria-hidden={true} />
              <span>{l10n.t(LocalizationKey.commonDelete)}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
