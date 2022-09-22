import * as React from 'react';
import {ClockIcon} from '@heroicons/react/outline';
import DatePicker from 'react-datepicker';
import { forwardRef, useEffect, useMemo } from 'react';
import { DateHelper } from '../../../helpers/DateHelper';
import { BaseFieldProps } from '../../../models';
import { FieldMessage } from './FieldMessage';
import { FieldTitle } from './FieldTitle';

export interface IDateTimeFieldProps extends BaseFieldProps<Date | null> {
  format?: string;
  onChange: (date: Date) => void;
}

type InputProps = JSX.IntrinsicElements["input"];

const CustomInput = forwardRef<HTMLInputElement, InputProps>(({ value, onClick }, ref) => {
  return (
    <button className="example-custom-input" onClick={onClick as any} ref={ref as any}>
      {value || "Pick your date"}
    </button>
  )
});

export const DateTimeField: React.FunctionComponent<IDateTimeFieldProps> = ({label, description, value, required, format, onChange}: React.PropsWithChildren<IDateTimeFieldProps>) => {
  const [ dateValue, setDateValue ] = React.useState<Date | null>(null);
  
  const onDateChange = (date: Date) => {
    setDateValue(date);
    onChange(date);
  };

  const showRequiredState = useMemo(() => {
    return required && !dateValue;
  }, [required, dateValue]);

  useEffect(() => {
    const crntValue = DateHelper.tryParse(value, format);
    const stateValue = DateHelper.tryParse(dateValue, format);

    if (crntValue?.toISOString() !== stateValue?.toISOString()) {
      setDateValue(value);
    }
  }, [ value, dateValue ]);

  return (
    <div className={`metadata_field`}>
      <FieldTitle 
        label={label}
        icon={<ClockIcon />}
        required={required} />

      <div className={`metadata_field__datetime`}>
        <DatePicker
          selected={DateHelper.tryParse(dateValue) as Date || new Date()}
          onChange={onDateChange}
          timeInputLabel="Time:"
          dateFormat={DateHelper.formatUpdate(format) || "MM/dd/yyyy HH:mm"}
          customInput={(<CustomInput />)}
          showTimeInput
          />

        <button className={`metadata_field__datetime__now`} onClick={() => onDateChange(new Date())}>
          now
        </button>
      </div>

      <FieldMessage name={label.toLowerCase()} description={description} showRequired={showRequiredState} />
    </div>
  );
};