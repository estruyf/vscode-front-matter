import xor = require('lodash.xor');
import * as React from 'react';
import { Ref } from 'react';
import { HTMLFieldProps, connectField, filterDOMProps } from 'uniforms';
import { LabelField } from './LabelField';
import './SelectField.css';

const base64: typeof btoa =
  typeof btoa === 'undefined'
    ? /* istanbul ignore next */ (x) => Buffer.from(x).toString('base64')
    : btoa;
const escape = (x: string) => base64(encodeURIComponent(x)).replace(/=+$/, '');

export type SelectFieldProps = HTMLFieldProps<
  string | string[],
  HTMLDivElement,
  {
    allowedValues?: string[];
    checkboxes?: boolean;
    disableItem?: (value: string) => boolean;
    inputRef?: Ref<HTMLSelectElement>;
    transform?: (value: string) => string;
  }
>;

function Select({
  allowedValues = [],
  checkboxes,
  disabled,
  fieldType,
  id,
  inputRef,
  label,
  name,
  onChange,
  placeholder,
  readOnly,
  required,
  disableItem,
  transform,
  value = [],
  ...props
}: SelectFieldProps) {
  const multiple = fieldType === Array;
  return (
    <div className="autoform__select_field" {...filterDOMProps(props)}>
      <LabelField label={label} id={id} required={required} />

      {checkboxes ? (
        allowedValues.map((item) => (
          <div key={item}>
            <input
              checked={fieldType === Array ? value.includes(item) : value === item}
              disabled={disableItem?.(item) ?? disabled}
              id={`${id}-${escape(item)}`}
              name={name}
              onChange={() => {
                if (!readOnly) {
                  onChange(fieldType === Array ? xor([item], value) : item);
                }
              }}
              type="checkbox"
            />

            <label htmlFor={`${id}-${escape(item)}`}>{transform ? transform(item) : item}</label>
          </div>
        ))
      ) : (
        <select
          disabled={disabled}
          id={id}
          multiple={multiple}
          name={name}
          onChange={(event) => {
            if (!readOnly) {
              const item = event.target.value;
              if (multiple) {
                const clear = event.target.selectedIndex === -1;
                onChange(clear ? [] : xor([item], value));
              } else {
                onChange(item !== '' ? item : undefined);
              }
            }
          }}
          ref={inputRef}
          value={value ?? ''}
          style={{ width: '100%', padding: '0.5rem' }}
        >
          {(!!placeholder || !required || value === undefined) && !multiple && (
            <option value="" disabled={required} hidden={required}>
              {placeholder || label}
            </option>
          )}

          {allowedValues?.map((value) => (
            <option disabled={disableItem?.(value)} key={value} value={value}>
              {transform ? transform(value) : value}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default connectField<SelectFieldProps>(Select, { kind: 'leaf' });
