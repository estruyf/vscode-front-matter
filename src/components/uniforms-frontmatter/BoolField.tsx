import * as React from 'react';
import { Ref } from 'react';
import { HTMLFieldProps, connectField, filterDOMProps } from 'uniforms';
import { LabelStyles } from './component-styles';
import './BoolField.css';

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
      {label && <label htmlFor={id} style={LabelStyles}>{label}</label>}
      
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
