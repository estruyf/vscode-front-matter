import { CalculatorIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useEffect } from 'react';
import { VsLabel } from '../VscodeComponents';

export interface INumberFieldProps {
  label: string;
  value: number | null;
  onChange: (nrValue: number | null) => void;
}

export const NumberField: React.FunctionComponent<INumberFieldProps> = ({label, value, onChange}: React.PropsWithChildren<INumberFieldProps>) => {
  const [ nrValue, setNrValue ] = React.useState<number | null>(value);

  const onValueChange = (txtValue: string) => {
    let newValue: number | null = parseInt(txtValue);
    if (isNaN(newValue)) {
      newValue = null;
    }

    setNrValue(newValue);
    onChange(newValue);
  };

  useEffect(() => {
    if (nrValue !== value) {
      setNrValue(value);
    }
  }, [value]);

  return (
    <div className={`metadata_field`}>
      <VsLabel>
        <div className={`metadata_field__label`}>
          <CalculatorIcon style={{ width: "16px", height: "16px" }} /> <span style={{ lineHeight: "16px"}}>{label}</span>
        </div>
      </VsLabel>
      
      <input type={`number`} className={`metadata_field__number`} value={`${nrValue}`} onChange={(e) => onValueChange(e.target.value)} />
    </div>
  );
};