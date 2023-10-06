import * as React from 'react';
import { PanelSettings, CustomScript as ICustomScript } from '../../models';
import { Collapsible } from './Collapsible';
import { CustomScript } from './CustomScript';
import { Preview } from './Preview';
import { SlugAction } from './SlugAction';
import { StartServerButton } from './StartServerButton';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';
import { OpenOnWebsiteAction } from './Actions/OpenOnWebsiteAction';
import useContentType from '../../hooks/useContentType';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { CommandToCode } from '../CommandToCode';

export interface IActionsProps {
  metadata?: any;
  settings: PanelSettings;
  scripts?: ICustomScript[];
}

const Actions: React.FunctionComponent<IActionsProps> = ({
  metadata,
  settings,
  scripts = []
}: React.PropsWithChildren<IActionsProps>) => {
  const contentType = useContentType(settings, metadata);
  const disableActions = settings.disabledActions || [];

  const openDashboard = () => {
    messageHandler.send(CommandToCode.openDashboard);
  };

  const createContent = () => {
    messageHandler.send(CommandToCode.createContent);
  };

  const actions = React.useMemo(() => {
    let allActions: JSX.Element[] = [];

    if (!disableActions.includes(`openDashboard`)) {
      allActions.push(
        <button
          title={l10n.t(LocalizationKey.panelBaseViewActionOpenDashboard)}
          onClick={openDashboard}
          type={`button`}>
          {l10n.t(LocalizationKey.panelBaseViewActionOpenDashboard)}
        </button>
      );
    }

    if (metadata?.title && !disableActions.includes(`optimizeSlug`)) {
      allActions.push(<SlugAction key="optimizeSlug" />);
    }

    if (settings?.preview?.host && !disableActions.includes(`preview`)) {
      if ((metadata && metadata.slug) || !metadata) {
        allActions.push(<Preview key="preview" />);
      }
    }

    if (!disableActions.includes(`openOnWebsite`) && metadata?.slug) {
      allActions.push(<OpenOnWebsiteAction key="openOnWebsite" baseUrl={settings.websiteUrl} slug={metadata.slug} />);
    }

    if (!disableActions.includes(`startStopServer`)) {
      allActions.push(<StartServerButton key="startStopServer" settings={settings} />);
    }

    if (!disableActions.includes(`createContent`)) {
      allActions.push(
        <button
          title={l10n.t(LocalizationKey.panelBaseViewActionCreateContent)}
          onClick={createContent}
          type={`button`}>
          {l10n.t(LocalizationKey.panelBaseViewActionCreateContent)}
        </button>
      );
    }

    return allActions;
  }, [metadata, settings, disableActions]);


  const customActions = React.useMemo(() => {
    let allActions: JSX.Element[] = [];

    if (!disableActions.includes(`customActions`)) {
      if (contentType?.name) {
        scripts = scripts.filter((script) => {
          if (script.contentTypes && script.contentTypes.length > 0) {
            return script.contentTypes.includes(contentType.name);
          }

          return true;
        });
      }

      allActions = scripts.map((value, idx) => (
        <CustomScript key={value?.title?.replace(/ /g, '') || idx} {...value} />
      ))
    }

    return allActions;
  }, [scripts, contentType, disableActions]);

  if (!settings || (customActions.length === 0 && actions.length === 0)) {
    return null;
  }

  return (
    <Collapsible id={`actions`} title={l10n.t(LocalizationKey.panelActionsTitle)}>
      <div className={`article__actions`}>
        {...actions}

        {customActions?.length > 0 && (
          <>
            {actions?.length > 0 && <div className="divider py-4 w-full" style={{ height: `1px` }}></div>}

            {...customActions}
          </>
        )}
      </div>
    </Collapsible>
  );
};

Actions.displayName = 'Actions';
export { Actions };
