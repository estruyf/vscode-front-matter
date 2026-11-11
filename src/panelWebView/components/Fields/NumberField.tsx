import { CalculatorIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { BaseFieldProps, NumberOptions } from '../../../models';
import { FieldTitle } from './FieldTitle';
import { FieldMessage } from './FieldMessage';
import { useDebounce } from '../../../hooks/useDebounce';

const DEBOUNCE_TIME = 300;
// How long a local edit keeps precedence over incoming values that are not the echo of our own update
const EXTERNAL_UPDATE_GRACE = 1500;

const toText = (nrValue: number | null | undefined): string =>
  nrValue === null || nrValue === undefined ? '' : `${nrValue}`;

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
  // The typed text is kept, so that values like "1." or "1.0" are not replaced by the parsed number while typing
  const [text, setText] = React.useState<string>(toText(value));
  // Timestamp of the last local edit, null when the field is in sync with the front matter
  const lastTypedRef = useRef<number | null>(null);
  // Last value we sent to, or accepted from, the extension host. Used to recognize the echo of our own update.
  const lastSentRef = useRef<number | null | undefined>(undefined);

  const parseValue = (txtValue: string): number | null => {
    const newValue: number | null = options?.isDecimal ? parseFloat(txtValue) : parseInt(txtValue);
    return isNaN(newValue) ? null : newValue;
  };

  /**
   * Send the number to the extension host when it is a local edit that was not sent yet
   */
  const sendValue = (txtValue: string) => {
    if (lastTypedRef.current === null) {
      // Not a local edit (ex. text was set from the incoming value)
      return;
    }

    const outgoing = parseValue(txtValue);
    const baseline = lastSentRef.current !== undefined ? lastSentRef.current : value;
    if (outgoing === baseline) {
      if (baseline === value) {
        lastTypedRef.current = null;
      }
      return;
    }

    lastSentRef.current = outgoing;
    onChange(outgoing);
  };

  // A pending edit is sent when the field unmounts before the debounce time passed (ex. switching files)
  const debouncedText = useDebounce<string>(text, DEBOUNCE_TIME, sendValue);

  const onValueChange = (txtValue: string) => {
    setText(txtValue);
    lastTypedRef.current = Date.now();
  };

  const showRequiredState = useMemo(() => {
    return required && parseValue(text) === null;
  }, [required, text]);

  const stepValue = useMemo(() => {
    if (options?.isDecimal) {
      return options?.step ?? 0.1;
    }

    return options?.step ?? 1;
  }, [options?.step]);

  useEffect(() => {
    if (lastSentRef.current !== undefined && value === lastSentRef.current) {
      // Echo of our own update. When nothing was typed since, the field is in sync again.
      if (parseValue(text) === value) {
        lastTypedRef.current = null;
      }
      return;
    }

    // Could be the (stale) echo of an older update or an external change. While the user is
    // typing, the local text wins; otherwise the incoming value is applied.
    const hasPendingEdit =
      lastTypedRef.current !== null && Date.now() - lastTypedRef.current < EXTERNAL_UPDATE_GRACE;
    if (hasPendingEdit) {
      return;
    }

    lastTypedRef.current = null;
    lastSentRef.current = value;
    if (parseValue(text) !== value) {
      setText(toText(value));
    }
  }, [value]);

  useEffect(() => {
    sendValue(debouncedText);
  }, [debouncedText]);

  return (
    <div className={`metadata_field ${showRequiredState ? 'required' : ''}`}>
      <FieldTitle label={label} icon={<CalculatorIcon />} required={required} />

      <input
        type={`number`}
        className={`metadata_field__number`}
        value={text}
        min={options?.min ?? undefined}
        max={options?.max ?? undefined}
        step={stepValue}
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
