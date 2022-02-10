import * as React from 'react';
import { Ref } from 'react';
import { HTMLFieldProps, connectField, filterDOMProps } from 'uniforms';
import { LabelStyles } from './component-styles';

export type NumFieldProps = HTMLFieldProps<
  number,
  HTMLDivElement,
  { decimal?: boolean; inputRef?: Ref<HTMLInputElement> }
>;

function Num({
  decimal,
  disabled,
  id,
  inputRef,
  label,
  max,
  min,
  name,
  onChange,
  placeholder,
  readOnly,
  step,
  value,
  ...props
}: NumFieldProps) {
  return (
    <div {...filterDOMProps(props)}>
      {label && <label htmlFor={id} style={LabelStyles}>{label}</label>}

      <input
        disabled={disabled}
        id={id}
        max={max}
        min={min}
        name={name}
        onChange={event => {
          const parse = decimal ? parseFloat : parseInt;
          const value = parse(event.target.value);
          onChange(isNaN(value) ? undefined : value);
        }}
        placeholder={placeholder}
        readOnly={readOnly}
        ref={inputRef}
        step={step || (decimal ? 0.01 : 1)}
        type="number"
        value={value ?? ''}
      />
    </div>
  );
}

export default connectField<NumFieldProps>(Num, { kind: 'leaf' });
