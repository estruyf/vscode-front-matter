import * as React from 'react';
import { VsLabel } from '../VscodeComponents';
import { ClockIcon } from '@heroicons/react/outline';
import DatePicker from 'react-datepicker';
import { forwardRef } from 'react';
import { DateHelper } from '../../../helpers/DateHelper';

export interface IDateTimeFieldProps {
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

export const DateTimeField: React.FunctionComponent<IDateTimeFieldProps> = ({label, date, format, onChange}: React.PropsWithChildren<IDateTimeFieldProps>) => {
  const [ dateValue, setDateValue ] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const crntValue = DateHelper.tryParse(date, format);
    const stateValue = DateHelper.tryParse(dateValue, format);

    if (crntValue?.toISOString() !== stateValue?.toISOString()) {
      setDateValue(date);
    }
  }, [ date ]);
  
  const onDateChange = (date: Date) => {
    setDateValue(date);
    onChange(date);
  };

  return (
    <div className={`metadata_field`}>
      <VsLabel>
        <div className={`metadata_field__label`}>
          <ClockIcon style={{ width: "16px", height: "16px" }} /> <span style={{ lineHeight: "16px"}}>{label}</span>
        </div>
      </VsLabel>
      
      <div className={`metadata_field__datetime`}>
        <DatePicker
          selected={dateValue as Date || new Date()}
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
    </div>
  );
};