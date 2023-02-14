import * as React from 'react';
import { HTMLProps } from 'react';
import { Override, connectField, filterDOMProps } from 'uniforms';

export type ErrorFieldProps = Override<
  Omit<HTMLProps<HTMLDivElement>, 'onChange'>,
  { error?: unknown; errorMessage?: string }
>;

function Error({ children, error, errorMessage, ...props }: ErrorFieldProps) {
  return !error ? null : <div {...filterDOMProps(props)}>{children || errorMessage}</div>;
}

export default connectField<ErrorFieldProps>(Error, {
  initialValue: false,
  kind: 'leaf'
});
