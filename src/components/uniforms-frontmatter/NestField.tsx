import * as React from 'react';
import { HTMLFieldProps, connectField, filterDOMProps } from 'uniforms';

import AutoField from './AutoField';
import { LabelStyles } from './component-styles';

export type NestFieldProps = HTMLFieldProps<
  object,
  HTMLDivElement,
  { itemProps?: object }
>;

function Nest({
  children,
  fields,
  itemProps,
  label,
  ...props
}: NestFieldProps) {
  return (
    <div {...filterDOMProps(props)}>
      {label && <label style={LabelStyles}>{label}</label>}
      {children ||
        fields.map(field => (
          <AutoField key={field} name={field} {...itemProps} />
        ))}
    </div>
  );
}

export default connectField<NestFieldProps>(Nest);
