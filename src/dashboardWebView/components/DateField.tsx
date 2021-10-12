import { format } from 'date-fns';
import * as React from 'react';
import { DateHelper } from '../../helpers/DateHelper';

export interface IDateFieldProps {
  value: Date | string;
}

export const DateField: React.FunctionComponent<IDateFieldProps> = ({value}: React.PropsWithChildren<IDateFieldProps>) => {
  const [ dateValue, setDateValue ] = React.useState<string>("");

  React.useEffect(() => {
    try {
      const parsedValue = typeof value === 'string' ? DateHelper.tryParse(value) : value;
      const dateString = parsedValue ? format(parsedValue, 'yyyy-MM-dd') : parsedValue;
      setDateValue(dateString || "");
    } catch (e) {
      // Date is invalid
    }
  }, [value]);

  if (!dateValue) {
    return null;
  }

  return (
    <span className={`text-vulcan-100 dark:text-whisper-900 text-xs`}>{dateValue}</span>
  );
};