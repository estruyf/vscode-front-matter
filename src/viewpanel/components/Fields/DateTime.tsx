import * as React from 'react';
import { VsLabel } from '../VscodeComponents';
import { ClockIcon } from '@heroicons/react/outline';
import DatePicker from 'react-datepicker';
import { forwardRef } from 'react';

export interface IDateTimeProps {
  label: string;
  date: Date | null;
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

export const DateTime: React.FunctionComponent<IDateTimeProps> = ({label, date, format, onChange}: React.PropsWithChildren<IDateTimeProps>) => {
  const [ dateValue, setDateValue ] = React.useState<Date | null>(date);
  
  const onDateChange = (date: Date) => {
    setDateValue(date);
    onChange(date);
  };

  React.useEffect(() => {
    if (dateValue?.toISOString() !== date?.toISOString()) {
      setDateValue(date);
    }
  }, [ date ]);

  return (
    <div className={`metadata_field`}>
      <VsLabel>
        <div className={`metadata_field__label`}>
          <ClockIcon style={{ width: "16px", height: "16px" }} /> <span style={{ lineHeight: "16px"}}>{label}</span>
        </div>
      </VsLabel>
      
      <DatePicker
        selected={dateValue as Date}
        onChange={onDateChange}
        timeInputLabel="Time:"
        dateFormat={format || "MM/dd/yyyy HH:mm"}
        customInput={(<CustomInput />)}
        showTimeInput
         />
    </div>
  );
};