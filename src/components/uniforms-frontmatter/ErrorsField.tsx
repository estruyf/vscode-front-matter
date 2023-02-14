import * as React from 'react';
import { HTMLProps } from 'react';
import { filterDOMProps, useForm } from 'uniforms';
import './ErrorsField.css';

export type ErrorsFieldProps = HTMLProps<HTMLDivElement>;

export default function ErrorsField(props: ErrorsFieldProps) {
  const { error, schema } = useForm();
  return !error && !props.children ? null : (
    <div className="autoform-error">
      <div {...filterDOMProps(props)}>
        {props.children}

        <ul>
          {schema.getErrorMessages(error).map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
