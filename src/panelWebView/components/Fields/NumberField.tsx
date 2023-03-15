import { CalculatorIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { BaseFieldProps, NumberOptions } from '../../../models';
import { FieldTitle } from './FieldTitle';
import { FieldMessage } from './FieldMessage';

export interface INumberFieldProps extends BaseFieldProps<number | null> {
  options?: NumberOptions;
  onChange: (nrValue: number | null) => void;
}

export const NumberField: React.FunctionComponent<INumberFieldProps> = ({
  label,
  description,
  options,
  value,
  required,
  onChange
}: React.PropsWithChildren<INumberFieldProps>) => {
  const [nrValue, setNrValue] = React.useState<number | null>(value);

  const onValueChange = useCallback((txtValue: string) => {
    let newValue: number | null = options?.isDecimal ? parseFloat(txtValue) : parseInt(txtValue);
    if (isNaN(newValue)) {
      newValue = null;
    }

    setNrValue(newValue);
    onChange(newValue);
  }, [options?.isDecimal]);

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
        min={options?.min ?? undefined}
        max={options?.max ?? undefined}
        step={options?.step ?? undefined}
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
