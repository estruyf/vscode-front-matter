import * as React from 'react';
import { Children, cloneElement, isValidElement } from 'react';
import { HTMLFieldProps, connectField, filterDOMProps } from 'uniforms';
import { LabelStyles } from './component-styles';

import ListAddField from './ListAddField';
import ListItemField from './ListItemField';

import './ListField.css';

export type ListFieldProps = HTMLFieldProps<
  unknown[],
  HTMLDivElement,
  { initialCount?: number; itemProps?: object }
>;

function List({
  children = <ListItemField name="$" />,
  initialCount,
  itemProps,
  label,
  value,
  ...props
}: ListFieldProps) {
  return (
    <div className="autoform__list_field" {...filterDOMProps(props)}>
      {label && (
        <div style={LabelStyles}>
          {label}
        </div>
      )}

      {value?.map((item, itemIndex) =>
        Children.map(children, (child, childIndex) =>
          isValidElement(child)
            ? cloneElement(child, {
                key: `${itemIndex}-${childIndex}`,
                name: child.props.name?.replace('$', '' + itemIndex),
                ...itemProps,
              })
            : child,
        ),
      )}

      <ListAddField initialCount={initialCount} name="$" />
    </div>
  );
}

export default connectField<ListFieldProps>(List);
