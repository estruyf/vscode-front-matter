import { format } from 'date-fns';
import * as React from 'react';
import { DateHelper } from '../../../helpers/DateHelper';
import useThemeColors from '../../hooks/useThemeColors';

export interface IDateFieldProps {
  className?: string;
  value: Date | string;
}

export const DateField: React.FunctionComponent<IDateFieldProps> = ({
  className,
  value
}: React.PropsWithChildren<IDateFieldProps>) => {
  const [dateValue, setDateValue] = React.useState<string>('');
  const { getColors } = useThemeColors();

  React.useEffect(() => {
    try {
      const parsedValue = typeof value === 'string' ? DateHelper.tryParse(value) : value;
      const dateString = parsedValue ? format(parsedValue, 'yyyy-MM-dd') : parsedValue;
      setDateValue(dateString || '');
    } catch (e) {
      // Date is invalid
    }
  }, [value]);

  if (!dateValue) {
    return null;
  }

  return (
    <span className={`date__field ${className || ''} text-xs ${getColors(`text-vulcan-100 dark:text-whisper-900`, `text-[var(--vscode-editor-foreground)]`)}`}>
      {dateValue}
    </span>
  );
};
