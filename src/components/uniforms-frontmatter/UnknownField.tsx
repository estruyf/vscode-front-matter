import { Ref } from 'react';
import * as React from 'react';
import { HTMLFieldProps, connectField, filterDOMProps } from 'uniforms';
import { LabelField } from './LabelField';

export type UnknownFieldProps = HTMLFieldProps<
  string,
  HTMLDivElement,
  { inputRef?: Ref<HTMLInputElement> }
>;

function UnknownField({
  autoComplete,
  disabled,
  id,
  inputRef,
  label,
  name,
  onChange,
  placeholder,
  readOnly,
  type,
  value,
  ...props
}: UnknownFieldProps) {
  return (
    <div {...filterDOMProps(props)}>
      <LabelField label={label} id={id} required={props.required} />

      <div className={`text-[var(--vscode-errorForeground)]`}>Unknown field</div>
    </div>
  );
}

UnknownField.defaultProps = { type: 'text' };

export default connectField<UnknownFieldProps>(UnknownField, { kind: 'leaf' });
