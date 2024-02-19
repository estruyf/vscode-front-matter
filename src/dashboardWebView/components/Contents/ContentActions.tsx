import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import { EyeIcon, GlobeEuropeAfricaIcon, CommandLineIcon, TrashIcon, EllipsisVerticalIcon, LanguageIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { CustomScript, I18nConfig, ScriptType } from '../../../models';
import { DashboardMessage } from '../../DashboardMessage';
import { QuickAction } from '../Menu';
import { Alert } from '../Modals/Alert';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SettingsSelector } from '../../state';
import { COMMAND_NAME, GeneralCommands } from '../../../constants';
import { PinIcon } from '../Icons/PinIcon';
import { PinnedItemsAtom } from '../../state/atom/PinnedItems';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../../../components/shadcn/Dropdown';

export interface IContentActionsProps {
  title: string;
  path: string;
  relPath: string;
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
  title,
  path,
  relPath,
  scripts,
  onOpen,
  listView,
  isDefaultLocale,
  translations,
  locale
}: React.PropsWithChildren<IContentActionsProps>) => {
  const [pinnedItems, setPinnedItems] = useRecoilState(PinnedItemsAtom);
  const [showDeletionAlert, setShowDeletionAlert] = React.useState(false);
  const settings = useRecoilValue(SettingsSelector);

  const onView = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    onOpen();
  };

  const onDelete = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    setShowDeletionAlert(true);
  };

  const onDeleteConfirm = () => {
    if (path) {
      Messenger.send(DashboardMessage.deleteFile, path);
    }
    setShowDeletionAlert(false);
  };

  const onOpenFile = (filePath: string) => {
    messageHandler.send(DashboardMessage.openFile, filePath);
  }

  const openOnWebsite = React.useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (settings?.websiteUrl && path) {
      Messenger.send(GeneralCommands.toVSCode.openOnWebsite, {
        websiteUrl: settings.websiteUrl,
        filePath: path
      });
    }
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

  const runCustomScript = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>, script: CustomScript) => {
      e.stopPropagation();
      Messenger.send(DashboardMessage.runCustomScript, { script, path });
    },
    [path]
  );

  const runCommand = React.useCallback((commandId: string) => {
    messageHandler.send(GeneralCommands.toVSCode.runCommand, {
      command: commandId,
      args: path
    })
  }, [path]);

  const isPinned = React.useMemo(() => {
    return pinnedItems.includes(relPath);
  }, [pinnedItems, relPath]);

  const customScriptActions = React.useMemo(() => {
    return (scripts || [])
      .filter(
        (script) =>
          (script.type === undefined || script.type === ScriptType.Content) &&
          !script.bulk &&
          !script.hidden
      )
      .map((script) => (
        <DropdownMenuItem key={script.id || script.title} onClick={(e) => runCustomScript(e, script)}>
          <CommandLineIcon className={`mr-2 h-4 w-4`} aria-hidden={true} />
          <span>{script.title}</span>
        </DropdownMenuItem>
      ));
  }, [scripts]);

  const translationsMenu = React.useMemo(() => {
    if (!locale || !translations || Object.keys(translations).length === 0) {
      return null;
    }

    const crntLocale = translations[locale.locale];
    const otherLocales = Object.entries(translations).filter(([key]) => key !== locale.locale);

    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <LanguageIcon className={`mr-2 h-4 w-4`} aria-hidden={true} />
          <span>{l10n.t(LocalizationKey.dashboardContentsContentActionsTranslationsMenu)}</span>
        </DropdownMenuSubTrigger>

        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onOpenFile(crntLocale.path)}>
              <span>{crntLocale.locale.title || crntLocale.locale.locale}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {
              otherLocales.map(([key, value]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onOpenFile(value.path)}
                >
                  <span>{value.locale.title || value.locale.locale}</span>
                </DropdownMenuItem>
              ))
            }
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    );
  }, [translations, locale, isDefaultLocale]);

  return (
    <>
      <div
        className={`${listView ? '' : 'group/card absolute top-6 right-0'
          } flex flex-col space-y-4`}
      >
        <div
          className={`flex items-center border border-transparent rounded-full ${listView ? '' : 'p-2 -mt-4'
            } group-hover/card:bg-[var(--vscode-sideBar-background)] group-hover/card:border-[var(--frontmatter-border)]`}
        >
          <div className={`relative flex text-left`}>
            {!listView && (
              <div className="hidden group-hover/card:flex">
                <QuickAction title={l10n.t(LocalizationKey.dashboardContentsContentActionsMenuItemView)} onClick={onView}>
                  <EyeIcon className={`w-4 h-4`} aria-hidden="true" />
                </QuickAction>

                {
                  settings?.websiteUrl && (
                    <QuickAction title={l10n.t(LocalizationKey.commonOpenOnWebsite)} onClick={openOnWebsite}>
                      <GlobeEuropeAfricaIcon className={`w-4 h-4`} aria-hidden="true" />
                    </QuickAction>
                  )
                }

                <QuickAction
                  title={l10n.t(LocalizationKey.commonDelete)}
                  className={`hover:text-[var(--vscode-statusBarItem-errorBackground)]`}
                  onClick={onDelete}>
                  <TrashIcon className={`w-4 h-4`} aria-hidden="true" />
                </QuickAction>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger className='text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-tab-activeForeground)] focus:outline-none'>
                <span className="sr-only">{l10n.t(LocalizationKey.dashboardContentsContentActionsActionMenuButtonTitle)}</span>
                <EllipsisVerticalIcon className="w-4 h-4" aria-hidden="true" />
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

                {
                  settings?.websiteUrl && (
                    <DropdownMenuItem onClick={openOnWebsite}>
                      <GlobeEuropeAfricaIcon className={`mr-2 h-4 w-4`} aria-hidden={true} />
                      <span>{l10n.t(LocalizationKey.commonOpenOnWebsite)}</span>
                    </DropdownMenuItem>
                  )
                }

                {
                  locale && isDefaultLocale && (
                    <DropdownMenuItem onClick={() => runCommand(COMMAND_NAME.i18n.create)}>
                      <LanguageIcon className={`mr-2 h-4 w-4`} aria-hidden={true} />
                      <span>{l10n.t(LocalizationKey.dashboardContentsContentActionsTranslationsCreate)}</span>
                    </DropdownMenuItem>
                  )
                }

                {translationsMenu}

                {customScriptActions}

                <DropdownMenuItem onClick={onDelete} className={`focus:bg-[var(--vscode-statusBarItem-errorBackground)] focus:text-[var(--vscode-statusBarItem-errorForeground)]`}>
                  <TrashIcon className={`mr-2 h-4 w-4`} aria-hidden={true} />
                  <span>{l10n.t(LocalizationKey.commonDelete)}</span>
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {showDeletionAlert && (
        <Alert
          title={l10n.t(LocalizationKey.dashboardContentsContentActionsAlertTitle, title)}
          description={l10n.t(LocalizationKey.dashboardContentsContentActionsAlertDescription, title)}
          okBtnText={l10n.t(LocalizationKey.commonDelete)}
          cancelBtnText={l10n.t(LocalizationKey.commonCancel)}
          dismiss={() => setShowDeletionAlert(false)}
          trigger={onDeleteConfirm}
        />
      )}
    </>
  );
};
