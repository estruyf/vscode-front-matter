import * as React from 'react';
import { Ref } from 'react';
import { HTMLFieldProps, connectField, filterDOMProps } from 'uniforms';
import { LabelField } from './LabelField';

export type LongTextFieldProps = HTMLFieldProps<
  string,
  HTMLDivElement,
  { inputRef?: Ref<HTMLTextAreaElement>, description?: string }
>;

function LongText({
  disabled,
  id,
  inputRef,
  label,
  name,
  onChange,
  placeholder,
  readOnly,
  value,
  ...props
}: LongTextFieldProps) {
  return (
    <div {...filterDOMProps(props)}>
      <LabelField label={label} id={id} required={props.required} />

      <textarea
        className={`block w-full py-2 pr-2 sm:text-sm appearance-none disabled:opacity-50 rounded bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] placeholder-[var(--vscode-input-placeholderForeground)] border-[var(--frontmatter-border)] focus:border-[var(--vscode-focusBorder)] focus:outline-0`}
        disabled={disabled}
        id={id}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        ref={inputRef}
        value={value ?? ''}
      />

      {
        props.description && (
          <span className='block text-xs text-[var(--vscode--settings-headerForeground)] opacity-75 mt-2 mx-2'>{props.description}</span>
        )
      }
    </div>
  );
}

export default connectField<LongTextFieldProps>(LongText, { kind: 'leaf' });
