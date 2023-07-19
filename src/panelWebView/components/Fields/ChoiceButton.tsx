import { XIcon } from '@heroicons/react/outline';
import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IChoiceButtonProps {
  title: string;
  value: string;
  onClick: (value: string) => void;
}

export const ChoiceButton: React.FunctionComponent<IChoiceButtonProps> = ({
  title,
  value,
  onClick
}: React.PropsWithChildren<IChoiceButtonProps>) => {
  return (
    <button
      title={l10n.t(LocalizationKey.panelFieldsChoiceButtonTitle, title)}
      className="metadata_field__choice__button"
      onClick={() => onClick(value)}
    >
      {title}
      <XIcon className={`metadata_field__choice__button_icon`} />
    </button>
  );
};
