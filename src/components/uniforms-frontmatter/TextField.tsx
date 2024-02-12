import { Ref } from 'react';
import * as React from 'react';
import { HTMLFieldProps, connectField, filterDOMProps } from 'uniforms';
import { LabelField } from './LabelField';

export type TextFieldProps = HTMLFieldProps<
  string,
  HTMLDivElement,
  { inputRef?: Ref<HTMLInputElement> }
>;

function Text({
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
}: TextFieldProps) {
  return (
    <div {...filterDOMProps(props)}>
      <LabelField label={label} id={id} required={props.required} />

      <input
        className='block w-full py-2 pr-2 sm:text-sm appearance-none disabled:opacity-50 rounded bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] placeholder-[var(--vscode-input-placeholderForeground)] border-[var(--frontmatter-border)] focus:border-[var(--vscode-focusBorder)] focus:outline-0'
        autoComplete={autoComplete}
        disabled={disabled}
        id={id}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        ref={inputRef}
        type={type}
        value={value ?? ''}
      />
    </div>
  );
}

Text.defaultProps = { type: 'text' };

export default connectField<TextFieldProps>(Text, { kind: 'leaf' });
