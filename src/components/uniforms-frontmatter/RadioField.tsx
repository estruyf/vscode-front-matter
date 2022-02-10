import omit = require('lodash.omit');
import * as React from 'react';
import { HTMLFieldProps, connectField, filterDOMProps } from 'uniforms';
import { LabelStyles } from './component-styles';

const base64: typeof btoa =
  typeof btoa === 'undefined'
    ? /* istanbul ignore next */ x => Buffer.from(x).toString('base64')
    : btoa;
const escape = (x: string) => base64(encodeURIComponent(x)).replace(/=+$/, '');

export type RadioFieldProps = HTMLFieldProps<
  string,
  HTMLDivElement,
  {
    allowedValues?: string[];
    checkboxes?: boolean;
    transform?: (value: string) => string;
  }
>;

function Radio({
  allowedValues,
  disabled,
  id,
  label,
  name,
  onChange,
  readOnly,
  transform,
  value,
  ...props
}: RadioFieldProps) {
  return (
    <div {...omit(filterDOMProps(props), ['checkboxes'])}>
      {label && <label style={LabelStyles}>{label}</label>}

      {allowedValues?.map(item => (
        <div key={item}>
          <input
            checked={item === value}
            disabled={disabled}
            id={`${id}-${escape(item)}`}
            name={name}
            onChange={() => {
              if (!readOnly) {
                onChange(item);
              }
            }}
            type="radio"
          />

          <label htmlFor={`${id}-${escape(item)}`}>
            {transform ? transform(item) : item}
          </label>
        </div>
      ))}
    </div>
  );
}

export default connectField<RadioFieldProps>(Radio, { kind: 'leaf' });
