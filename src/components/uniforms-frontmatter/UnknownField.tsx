import { Ref } from 'react';
import * as React from 'react';
import { HTMLFieldProps, connectField, filterDOMProps } from 'uniforms';
import { LabelField } from './LabelField';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

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

      <div className={`text-[var(--vscode-errorForeground)]`}>{l10n.t(LocalizationKey.fieldUnknown)}</div>
    </div>
  );
}

UnknownField.defaultProps = { type: 'text' };

export default connectField<UnknownFieldProps>(UnknownField, { kind: 'leaf' });
