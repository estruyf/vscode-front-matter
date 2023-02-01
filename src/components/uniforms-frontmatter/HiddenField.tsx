import * as React from 'react';
import { HTMLProps, Ref, useEffect } from 'react';
import { Override, filterDOMProps, useField } from 'uniforms';

type ValueType = string | number | readonly string[] | undefined
export type HiddenFieldProps = Override<
  HTMLProps<HTMLInputElement>,
  {
    inputRef?: Ref<HTMLInputElement>;
    name: string;
    noDOM?: boolean;
    value?: ValueType;
  }
>;

export default function HiddenField({ value, ...rawProps }: HiddenFieldProps) {
  const props = useField(rawProps.name, rawProps, { initialValue: false })[0];
  const defaultValue = props.value as ValueType ?? ''

  useEffect(() => {
    if (value !== undefined && value !== props.value) {
      props.onChange(value);
    }
  });

  return props.noDOM ? null : (
    <input
      disabled={props.disabled}
      name={props.name}
      readOnly={props.readOnly}
      ref={props.inputRef}
      type="hidden"
      value={value ?? defaultValue}
      {...filterDOMProps(props)}
    />
  );
}
