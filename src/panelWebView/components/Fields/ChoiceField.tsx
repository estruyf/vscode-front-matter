import { CheckIcon, ChevronDownIcon } from '@heroicons/react/outline';
import Downshift from 'downshift';
import * as React from 'react';
import { useEffect } from 'react';
import { Choice } from '../../../models/Choice';
import { VsLabel } from '../VscodeComponents';
import { ChoiceButton } from './ChoiceButton';

export interface IChoiceFieldProps {
  label: string;
  selected: string | string[];
  choices: string[] | Choice[];
  multiSelect?: boolean;
  onChange: (value: string | string[]) => void;
}

export const ChoiceField: React.FunctionComponent<IChoiceFieldProps> = ({label, selected, choices, multiSelect, onChange}: React.PropsWithChildren<IChoiceFieldProps>) => {
  const [ crntSelected, setCrntSelected ] = React.useState<string | string[] | null>(selected);
  const dsRef = React.useRef<Downshift<string> | null>(null);

  const onValueChange = (txtValue: string) => {
    if (multiSelect) {
      const newValue = [...(crntSelected || []) as string[], txtValue];
      setCrntSelected(newValue);
      onChange(newValue);
    } else {
      setCrntSelected(txtValue);
      onChange(txtValue);
    }
  };

  const removeSelected = (txtValue: string) => {
    if (multiSelect) {
      const newValue = [...(crntSelected || [])].filter(v => v !== txtValue);
      setCrntSelected(newValue);
      onChange(newValue);
    } else {
      setCrntSelected("");
      onChange("");
    }
  };

  const getValue = (value: string | Choice, type: "id" | "title") => {
    if (typeof value === 'string' || typeof value === 'number') {
      return `${value}`;
    }
    return `${value[type]}`;
  };

  const getChoiceValue = (value: string) => {
    const choice = (choices as Array<string | Choice>).find((c: string | Choice) => getValue(c, 'id') === value);
    if (choice) {
      return getValue(choice, 'title');
    }
    return "";
  };

  useEffect(() => {
    if (crntSelected !== selected) {
      setCrntSelected(selected);
    }
  }, [selected]);
  
  const availableChoices = !multiSelect ? choices : (choices as Array<string | Choice>).filter((choice: string | Choice) => {
    const value = typeof choice === 'string' || typeof choice === 'number' ? choice : choice.id;

    if (typeof crntSelected === 'string') {
      return crntSelected !== `${value}`;
    } else if (crntSelected instanceof Array) {
      return crntSelected.indexOf(`${value}`) === -1;
    }

    return true;
  });

  return (
    <div className={`metadata_field`}>
      <VsLabel>
        <div className={`metadata_field__label`}>
          <CheckIcon style={{ width: "16px", height: "16px" }} /> <span style={{ lineHeight: "16px"}}>{label}</span>
        </div>
      </VsLabel>

      <Downshift 
        ref={dsRef}
        onChange={(selected) => onValueChange(selected || "")}
        itemToString={item => (item ? item : '')}>
        {({ getToggleButtonProps, getItemProps, getMenuProps, isOpen, getRootProps }) => (
          <div {...getRootProps(undefined, {suppressRefError: true})} className={`metadata_field__choice`}>
            <button 
              {...getToggleButtonProps({ 
                className: `metadata_field__choice__toggle`,
                disabled: availableChoices.length === 0 
              })}>
              <span>{`Select your ${label} value`}</span>
              <ChevronDownIcon className="icon" />
            </button>

            <ul className={`metadata_field__choice_list ${isOpen ? "open" : "closed" }`} {...getMenuProps()}>
              { 
                isOpen ? availableChoices.map((choice, index) => (
                  <li {...getItemProps({ 
                    key: getValue(choice, 'id'), 
                    index,
                    item: getValue(choice, 'id'),
                  })}>
                    { getValue(choice, 'title') || <span className={`metadata_field__choice_list__item`}>Clear value</span> }
                  </li>
                )) : null
              }
            </ul>
          </div>
        )}
      </Downshift>

      {
        crntSelected instanceof Array ? crntSelected.map((value: string) => (
          <ChoiceButton key={value} value={value} title={getChoiceValue(value)} onClick={removeSelected} />
        )) : (
          crntSelected && (
            <ChoiceButton key={crntSelected} value={crntSelected} title={getChoiceValue(crntSelected)} onClick={removeSelected} />
          )
        )
      }
    </div>
  );
};