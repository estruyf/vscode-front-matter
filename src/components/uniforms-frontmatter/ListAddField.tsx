import { PlusIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { HTMLFieldProps, connectField, filterDOMProps, joinName, useField } from 'uniforms';
import './ListAddField.css';

type ParentFieldType = { initialCount?: number; maxCount?: number };
type ValueType = string | readonly string[] | undefined;

export type ListAddFieldProps = HTMLFieldProps<
  ValueType,
  HTMLSpanElement,
  { initialCount?: number }
>;

function ListAdd({ disabled, initialCount, name, readOnly, value, ...props }: ListAddFieldProps) {
  const nameParts = joinName(null, name);
  const parentName = joinName(nameParts.slice(0, -1));

  const parent = useField<
    { initialCount?: number; maxCount?: number },
    unknown[]
  >(parentName, { initialCount }, { absoluteName: true })[0];

  const limitNotReached = !disabled && !(parent.maxCount! <= parent.value!.length);

  function onAction(event: React.KeyboardEvent | React.MouseEvent) {
    if (limitNotReached && !readOnly && (!('key' in event) || event.key === 'Enter')) {
      parent.onChange(parent.value!.concat([value]));
    }
  }

  return (
    <span
      className="autoform__list_add_field"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...filterDOMProps(props as any)}
      onClick={onAction}
      onKeyDown={onAction}
      role="button"
      tabIndex={0}
    >
      <PlusIcon />
    </span>
  );
}

export default connectField<ListAddFieldProps>(ListAdd, {
  initialValue: false,
  kind: 'leaf'
});
