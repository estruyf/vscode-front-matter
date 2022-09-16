import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { BaseFieldProps } from '../../../models';
import { ToggleIcon } from '../Icons/ToggleIcon';
import { FieldTitle } from './FieldTitle';
import { FieldMessage } from './FieldMessage';

export interface IToggleProps extends BaseFieldProps<boolean> {
  onChanged: (checked: boolean) => void;
}

export const Toggle: React.FunctionComponent<IToggleProps> = ({label, description, value, required, onChanged}: React.PropsWithChildren<IToggleProps>) => {
  const [ isChecked, setIsChecked ] = React.useState(value);
  
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(!isChecked);
    onChanged(!isChecked);
  };

  const showRequiredState = useMemo(() => {
    return required && value === null;
  }, [required, value]);

  useEffect(() => {
    if (isChecked !== value) {
      setIsChecked(value);
    }
  }, [ value ]);

  return (
    <div className={`metadata_field`}>
      <FieldTitle 
        label={label}
        icon={<ToggleIcon />}
        required={required} />

    
      <label className="field__toggle">
        <input type="checkbox" checked={value === null ? false : value} onChange={onChange} />
        <span className="field__toggle__slider"></span>
      </label>
      
      <FieldMessage name={label.toLowerCase()} description={description} showRequired={showRequiredState} />
    </div>
  );
};