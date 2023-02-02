import * as React from 'react';
import { Children, cloneElement, isValidElement } from 'react';
import { HTMLFieldProps, connectField, filterDOMProps } from 'uniforms';

import ListAddField from './ListAddField';
import ListItemField from './ListItemField';

import './ListField.css';
import { LabelField } from './LabelField';

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
      <LabelField label={label} id={props.id} required={props.required} />

      {value?.map((item, itemIndex) =>
        Children.map(children as React.ReactElement[], (child: React.ReactElement, childIndex) =>
          isValidElement(child)
            ? cloneElement(child, {
                key: `${itemIndex}-${childIndex}`,
                // name: '',
                // name: (child.props.name || '').replace('$', '' + itemIndex),
                ...itemProps
              })
            : child
        )
      )}

      <ListAddField initialCount={initialCount} name="$" />
    </div>
  );
}

export default connectField<ListFieldProps>(List);
