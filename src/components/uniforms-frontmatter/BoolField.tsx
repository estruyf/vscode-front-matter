import * as React from 'react';
import { Ref } from 'react';
import { HTMLFieldProps, connectField, filterDOMProps } from 'uniforms';
import './BoolField.css';
import { LabelField } from './LabelField';

export type BoolFieldProps = HTMLFieldProps<
  boolean,
  HTMLDivElement,
  { inputRef?: Ref<HTMLInputElement> }
>;

function Bool({
  disabled,
  id,
  inputRef,
  label,
  name,
  onChange,
  readOnly,
  value,
  ...props
}: BoolFieldProps) {
  return (
    <div {...filterDOMProps(props)}>
      <LabelField label={label} id={id} required={props.required} />
      
      <label className="field__toggle">
        <input
          checked={value || false}
          disabled={disabled}
          id={id}
          name={name}
          onChange={() => !disabled && !readOnly && onChange(!value)}
          ref={inputRef}
          type="checkbox"
        />
        <span className="field__toggle__slider"></span>
      </label>
    </div>
  );
}

export default connectField<BoolFieldProps>(Bool, { kind: 'leaf' });
