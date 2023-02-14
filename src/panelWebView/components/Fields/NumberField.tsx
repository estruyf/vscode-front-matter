import { CalculatorIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { BaseFieldProps } from '../../../models';
import { FieldTitle } from './FieldTitle';
import { FieldMessage } from './FieldMessage';

export interface INumberFieldProps extends BaseFieldProps<number | null> {
  onChange: (nrValue: number | null) => void;
}

export const NumberField: React.FunctionComponent<INumberFieldProps> = ({
  label,
  description,
  value,
  required,
  onChange
}: React.PropsWithChildren<INumberFieldProps>) => {
  const [nrValue, setNrValue] = React.useState<number | null>(value);

  const onValueChange = (txtValue: string) => {
    let newValue: number | null = parseInt(txtValue);
    if (isNaN(newValue)) {
      newValue = null;
    }

    setNrValue(newValue);
    onChange(newValue);
  };

  const showRequiredState = useMemo(() => {
    return required && (nrValue === null || nrValue === undefined);
  }, [required, nrValue]);

  useEffect(() => {
    if (nrValue !== value) {
      setNrValue(value);
    }
  }, [value]);

  return (
    <div className={`metadata_field ${showRequiredState ? 'required' : ''}`}>
      <FieldTitle label={label} icon={<CalculatorIcon />} required={required} />

      <input
        type={`number`}
        className={`metadata_field__number`}
        value={`${nrValue}`}
        onChange={(e) => onValueChange(e.target.value)}
      />

      <FieldMessage
        name={label.toLowerCase()}
        description={description}
        showRequired={showRequiredState}
      />
    </div>
  );
};
