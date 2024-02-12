import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import { Menu } from '@headlessui/react';
import { EyeIcon, GlobeEuropeAfricaIcon, CommandLineIcon, TrashIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { CustomScript, ScriptType } from '../../../models';
import { DashboardMessage } from '../../DashboardMessage';
import { MenuItem, MenuItems, ActionMenuButton, QuickAction } from '../Menu';
import { Alert } from '../Modals/Alert';
import { usePopper } from 'react-popper';
import { useState } from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SettingsSelector } from '../../state';
import { GeneralCommands } from '../../../constants';
import { PinIcon } from '../Icons/PinIcon';
import { PinnedItemsAtom } from '../../state/atom/PinnedItems';

export interface IContentActionsProps {
  title: string;
  path: string;
  relPath: string;
  scripts: CustomScript[] | undefined;
  listView?: boolean;
  onOpen: () => void;
}

export const ContentActions: React.FunctionComponent<IContentActionsProps> = ({
  title,
  path,
  relPath,
  scripts,
  onOpen,
  listView
}: React.PropsWithChildren<IContentActionsProps>) => {
  const [pinnedItems, setPinnedItems] = useRecoilState(PinnedItemsAtom);
  const [showDeletionAlert, setShowDeletionAlert] = React.useState(false);
  const settings = useRecoilValue(SettingsSelector);

  const [referenceElement, setReferenceElement] = useState<any>(null);
  const [popperElement, setPopperElement] = useState<any>(null);
  const { styles, attributes, forceUpdate } = usePopper(referenceElement, popperElement, {
    placement: listView ? 'right-start' : 'bottom-end',
    strategy: 'fixed'
  });

  const onView = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onOpen();
  };

  const onDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowDeletionAlert(true);
  };

  const onDeleteConfirm = () => {
    if (path) {
      Messenger.send(DashboardMessage.deleteFile, path);
    }
    setShowDeletionAlert(false);
  };

  const openOnWebsite = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (settings?.websiteUrl && path) {
      Messenger.send(GeneralCommands.toVSCode.openOnWebsite, {
        websiteUrl: settings.websiteUrl,
        filePath: path
      });
    }
  }, [settings?.websiteUrl, path]);

  const pinItem = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    messageHandler.request<string[]>(DashboardMessage.pinItem, path).then((result) => {
      setPinnedItems(result || []);
    })
  }, [path]);

  const unpinItem = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    messageHandler.request<string[]>(DashboardMessage.unpinItem, path).then((result) => {
      setPinnedItems(result || []);
    })
  }, [path]);

  const runCustomScript = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, script: CustomScript) => {
      e.stopPropagation();
      Messenger.send(DashboardMessage.runCustomScript, { script, path });
    },
    [path]
  );

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
        <MenuItem
          key={script.title}
          title={
            <div className="flex items-center">
              <CommandLineIcon className="mr-2 h-5 w-5 flex-shrink-0" aria-hidden={true} />{' '}
              <span>{script.title}</span>
            </div>
          }
          onClick={(value, e) => runCustomScript(e, script)}
        />
      ));
  }, [scripts]);

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
          <Menu as="div" className={`relative flex text-left`}>
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

                <QuickAction title={l10n.t(LocalizationKey.commonDelete)} onClick={onDelete}>
                  <TrashIcon className={`w-4 h-4`} aria-hidden="true" />
                </QuickAction>
              </div>
            )}

            <div ref={setReferenceElement} className={`flex`}>
              <ActionMenuButton title={l10n.t(LocalizationKey.dashboardContentsContentActionsActionMenuButtonTitle)} />
            </div>

            <div
              className="menu_items__wrapper z-20"
              ref={setPopperElement}
              style={styles.popper}
              {...attributes.popper}
            >
              <MenuItems
                updatePopper={forceUpdate || undefined}
                widthClass="w-44"
                marginTopClass={listView ? '' : ''}
              >
                <MenuItem
                  title={
                    <div className="flex items-center">
                      <PinIcon className={`mr-2 h-5 w-5 flex-shrink-0 ${isPinned ? "" : "-rotate-90"}`} aria-hidden={true} />{' '}
                      <span>{isPinned ? l10n.t(LocalizationKey.commonUnpin) : l10n.t(LocalizationKey.commonPin)}</span>
                    </div>
                  }
                  onClick={(_, e) => isPinned ? unpinItem(e) : pinItem(e)}
                />
                <MenuItem
                  title={
                    <div className="flex items-center">
                      <EyeIcon className="mr-2 h-5 w-5 flex-shrink-0" aria-hidden={true} />{' '}
                      <span>{l10n.t(LocalizationKey.dashboardContentsContentActionsMenuItemView)}</span>
                    </div>
                  }
                  onClick={(_, e) => onView(e)}
                />

                {
                  settings?.websiteUrl && (
                    <MenuItem
                      title={
                        <div className="flex items-center">
                          <GlobeEuropeAfricaIcon className="mr-2 h-5 w-5 flex-shrink-0" aria-hidden={true} />{' '}
                          <span>{l10n.t(LocalizationKey.commonOpenOnWebsite)}</span>
                        </div>
                      }
                      onClick={(_, e) => openOnWebsite(e)}
                    />
                  )
                }

                {customScriptActions}

                <MenuItem
                  title={
                    <div className="flex items-center">
                      <TrashIcon className="mr-2 h-5 w-5 flex-shrink-0" aria-hidden={true} />{' '}
                      <span>{l10n.t(LocalizationKey.commonDelete)}</span>
                    </div>
                  }
                  onClick={(_, e) => onDelete(e)}
                />
              </MenuItems>
            </div>
          </Menu>
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
