import * as React from 'react';
import { BaseFieldProps } from '../../../models';
import { ChoiceField } from './ChoiceField';
import { Toggle } from './Toggle';

export interface IDraftFieldProps extends BaseFieldProps<boolean | string | null | undefined> {
  type: "boolean" | "choice";

  choices?: string[];

  onChanged: (value: string | boolean) => void;
}

export const DraftField: React.FunctionComponent<IDraftFieldProps> = ({ label, type, value, choices, onChanged, required }: React.PropsWithChildren<IDraftFieldProps>) => {

  if (type === "boolean") {
    return (
      <Toggle 
        label={label}
        value={!!value}
        required={required}
        onChanged={(checked) => onChanged(checked)} />
    );
  }

  if (type === "choice") {
    return (
      <ChoiceField
        label={label}
        value={value as string}
        choices={choices as string[]}
        multiSelect={false}
        required={required}
        onChange={value => onChanged(value as string)} />
    );
  }

  return null;
};