import { CheckIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { VsLabel } from '../VscodeComponents';

export interface IChoiceFieldProps {
  label: string;
  selected: string;
  choices: string[];
  onChange: (value: string) => void;
}

export const ChoiceField: React.FunctionComponent<IChoiceFieldProps> = ({label, selected, choices, onChange}: React.PropsWithChildren<IChoiceFieldProps>) => {
  const [ crntSelected, setCrntSelected ] = React.useState<string | null>(selected);

  const onValueChange = (txtValue: string) => {
    setCrntSelected(txtValue);
    onChange(txtValue);
  };

  const containsSelected = selected && choices.indexOf(selected) !== -1;
  
  return (
    <div className={`metadata_field`}>
      <VsLabel>
        <div className={`metadata_field__label`}>
          <CheckIcon style={{ width: "16px", height: "16px" }} /> <span style={{ lineHeight: "16px"}}>{label}</span>
        </div>
      </VsLabel>
      
      <select 
        value={crntSelected || ""}
        placeholder={`Select from your ${label}`}
        className={`metadata_field__choice`} 
        onChange={(e) => onValueChange(e.currentTarget.value)}>
        { !containsSelected && <option value='' disabled hidden></option> }
        {choices.map((choice, index) => (
          <option key={index} value={choice} selected={crntSelected === selected}>{choice}</option>
        ))}
      </select>
    </div>
  );
};