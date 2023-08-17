import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IFieldMessageProps {
  name: string;
  description?: string;
  showRequired?: boolean;
}

export const FieldMessage: React.FunctionComponent<IFieldMessageProps> = ({
  name,
  description,
  showRequired
}: React.PropsWithChildren<IFieldMessageProps>) => {
  if (!showRequired && !description) {
    return null;
  }

  if (showRequired) {
    return (
      <div className={`metadata_field__required__message`}>
        {l10n.t(LocalizationKey.panelFieldsFieldMessageRequired, name)}
      </div>
    );
  }

  if (description) {
    return <div className={`metadata_field__description`}>{description}</div>;
  }

  return null;
};
