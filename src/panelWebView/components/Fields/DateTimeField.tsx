import * as React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import { forwardRef, useEffect, useMemo } from 'react';
import { DateHelper } from '../../../helpers/DateHelper';
import { BaseFieldProps } from '../../../models';
import { FieldMessage } from './FieldMessage';
import { FieldTitle } from './FieldTitle';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IDateTimeFieldProps extends BaseFieldProps<Date | null> {
  format?: string;
  onChange: (date: string) => void;
}

type InputProps = JSX.IntrinsicElements['input'];

const CustomInput = forwardRef<HTMLInputElement, InputProps>(({ value, onClick }, ref) => {
  return (
    <button className="example-custom-input" onClick={onClick as any} ref={ref as any}>
      {value || l10n.t(LocalizationKey.panelFieldsDateTimeFieldButtonPick)}
    </button>
  );
});

export const DateTimeField: React.FunctionComponent<IDateTimeFieldProps> = ({
  label,
  description,
  value,
  required,
  format,
  onChange
}: React.PropsWithChildren<IDateTimeFieldProps>) => {
  const DEFAULT_FORMAT = 'MM/dd/yyyy HH:mm';
  const [dateValue, setDateValue] = React.useState<Date | null>(null);

  const onDateChange = React.useCallback((date: Date) => {
    setDateValue(date);
    if (format) {
      onChange(DateHelper.format(date, format) || "");
    } else {
      onChange(date.toISOString());
    }
  }, [format, onChange]);

  const showRequiredState = useMemo(() => {
    return required && !dateValue;
  }, [required, dateValue]);

  const hasTimeFormat = useMemo(() => {
    if (!format) {
      return true;
    }

    return format?.toLowerCase().includes('h') ||
      format?.includes('m') ||
      format?.toLowerCase().includes('s') ||
      format?.toLowerCase().includes('a') ||
      format?.toLowerCase().includes('b') ||
      format?.toLowerCase().includes('k');
  }, [format]);

  useEffect(() => {
    const crntValue = DateHelper.tryParse(value, format);
    const stateValue = DateHelper.tryParse(dateValue, format);

    if (crntValue?.toISOString() !== stateValue?.toISOString()) {
      setDateValue(value);
    }
  }, [value, dateValue]);

  return (
    <div className={`metadata_field`}>
      <FieldTitle label={label} icon={<ClockIcon />} required={required} />

      <div className={`metadata_field__datetime`}>
        <DatePicker
          selected={(DateHelper.tryParse(dateValue, format) as Date) || null}
          onChange={onDateChange}
          timeInputLabel={l10n.t(LocalizationKey.panelFieldsDateTimeFieldTime)}
          dateFormat={DateHelper.formatUpdate(format) || DEFAULT_FORMAT}
          customInput={<CustomInput />}
          showTimeInput={hasTimeFormat}
        />

        <button
          className={`metadata_field__datetime__now`}
          onClick={() => onDateChange(new Date())}
        >
          now
        </button>
      </div>

      <FieldMessage
        name={label.toLowerCase()}
        description={description}
        showRequired={showRequiredState}
      />
    </div>
  );
};
