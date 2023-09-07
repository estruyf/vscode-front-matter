import { format as fnsFormat } from 'date-fns';
import * as React from 'react';
import { DateHelper } from '../../../helpers/DateHelper';
import useThemeColors from '../../hooks/useThemeColors';

export interface IDateFieldProps {
  className?: string;
  value: Date | string;
  format?: string;
}

export const DateField: React.FunctionComponent<IDateFieldProps> = ({
  className,
  value,
  format
}: React.PropsWithChildren<IDateFieldProps>) => {
  const [dateValue, setDateValue] = React.useState<string>('');
  const { getColors } = useThemeColors();

  React.useEffect(() => {
    try {
      const parsedValue = typeof value === 'string' ? DateHelper.tryParse(value, format) : value;
      const dateString = parsedValue ? fnsFormat(parsedValue, 'yyyy-MM-dd') : parsedValue;

      if (dateString) {
        setDateValue(dateString);
      } else if (!dateString && typeof value === 'string') {
        setDateValue(value);
      }
    } catch (e) {
      // Date is invalid
      setDateValue(typeof value === 'string' ? value : '');
    }
  }, [value, format]);

  if (!dateValue) {
    return null;
  }

  return (
    <span className={`date__field ${className || ''} text-xs ${getColors(`text-vulcan-100 dark:text-whisper-900`, `text-[var(--vscode-editor-foreground)]`)}`}>
      {dateValue}
    </span>
  );
};
