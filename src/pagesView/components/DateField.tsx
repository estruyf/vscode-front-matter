import { format, parseJSON } from 'date-fns';
import * as React from 'react';

export interface IDateFieldProps {
  value: Date | string;
}

export const DateField: React.FunctionComponent<IDateFieldProps> = ({value}: React.PropsWithChildren<IDateFieldProps>) => {

  const parsedValue = typeof value === 'string' ? parseJSON(value) : value;
  const dateString = format(parsedValue, 'yyyy-MM-dd');

  return (
    <span className={`text-vulcan-100 text-xs`}>{dateString}</span>
  );
};