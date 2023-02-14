import * as React from 'react';
import { HTMLFieldProps, connectField, filterDOMProps } from 'uniforms';

import AutoField from './AutoField';
import { LabelField } from './LabelField';

export type NestFieldProps = HTMLFieldProps<object, HTMLDivElement, { itemProps?: object }>;

function Nest({ children, fields, itemProps, label, ...props }: NestFieldProps) {
  return (
    <div {...filterDOMProps(props)}>
      <LabelField label={label} id={props.id} required={props.required} />

      {children || fields.map((field) => <AutoField key={field} name={field} {...itemProps} />)}
    </div>
  );
}

export default connectField<NestFieldProps>(Nest);
