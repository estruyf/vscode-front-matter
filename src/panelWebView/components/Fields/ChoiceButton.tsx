import { XMarkIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IChoiceButtonProps {
  title: string;
  value: string;
  className?: string;
  onClick: (value: string) => void;
}

export const ChoiceButton: React.FunctionComponent<IChoiceButtonProps> = ({
  title,
  value,
  className,
  onClick
}: React.PropsWithChildren<IChoiceButtonProps>) => {
  return (
    <button
      title={l10n.t(LocalizationKey.commonRemoveValue, title)}
      className={`metadata_field__choice__button text-left ${className || ""}`}
      onClick={() => onClick(value)}
    >
      <span>{title}</span>
      <XMarkIcon className={`metadata_field__choice__button_icon`} />
    </button>
  );
};
