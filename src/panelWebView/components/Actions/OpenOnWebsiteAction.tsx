import { messageHandler } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { ActionButton } from '../ActionButton';
import * as l10n from "@vscode/l10n"
import { LocalizationKey } from '../../../localization';
import { GeneralCommands } from '../../../constants';

export interface IOpenOnWebsiteActionProps {
  baseUrl: string;
  slug: string;
}

export const OpenOnWebsiteAction: React.FunctionComponent<IOpenOnWebsiteActionProps> = ({
  baseUrl,
  slug
}: React.PropsWithChildren<IOpenOnWebsiteActionProps>) => {

  const open = () => {
    messageHandler.send(GeneralCommands.toVSCode.openOnWebsite, {
      websiteUrl: baseUrl,
    });
  };

  if (!baseUrl || !slug) {
    return null;
  }

  return (
    <ActionButton
      title={l10n.t(LocalizationKey.commonOpenOnWebsite)}
      onClick={open}>
      {l10n.t(LocalizationKey.commonOpenOnWebsite)}
    </ActionButton>
  );
};