import * as React from 'react';
import { ReactNode } from 'react';
import './LabelField.css';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export interface ILabelFieldProps {
  id: string;
  label: string | ReactNode;
  required?: boolean;
}

export const LabelField: React.FunctionComponent<ILabelFieldProps> = ({
  label,
  id,
  required
}: React.PropsWithChildren<ILabelFieldProps>) => {
  return label ? (
    <label className="autoform__label" htmlFor={id}>
      {label}
      {required && (
        <span title={l10n.t(LocalizationKey.fieldRequired)} className="autoform__label__required">
          *
        </span>
      )}
    </label>
  ) : null;
};
