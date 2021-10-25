import * as React from 'react';
import { RocketIcon } from '../Icons/RocketIcon';
import { VsLabel } from '../VscodeComponents';
import { ChoiceField } from './ChoiceField';
import { Toggle } from './Toggle';

export interface IDraftFieldProps {
  label: string;
  type: "boolean" | "choice";
  value: boolean | string | null | undefined;

  choices?: string[];

  onChanged: (value: string | boolean) => void;
}

export const DraftField: React.FunctionComponent<IDraftFieldProps> = ({ label, type, value, choices, onChanged }: React.PropsWithChildren<IDraftFieldProps>) => {

  if (type === "boolean") {
    return (
      <Toggle 
        label={label}
        checked={!!value} 
        onChanged={(checked) => onChanged(checked)} />
    );
  }

  if (type === "choice") {
    return (
      <ChoiceField
        label={label}
        selected={value as string}
        choices={choices as string[]}
        multiSelect={false}
        onChange={value => onChanged(value as string)} />
    );
  }

  return null;
};