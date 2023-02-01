import { TrashIcon } from '@heroicons/react/outline';
import * as React from 'react';
import {
  HTMLFieldProps,
  connectField,
  filterDOMProps,
  joinName,
  useField,
} from 'uniforms';
import './ListDelField.css';

export type ListDelFieldProps = HTMLFieldProps<unknown, HTMLSpanElement>;

function ListDel({ disabled, name, readOnly, ...props }: ListDelFieldProps) {
  const nameParts = joinName(null, name);
  const nameIndex = +nameParts[nameParts.length - 1];
  const parentName = joinName(nameParts.slice(0, -1));
  const parent = {
    minCount: 0,
    value: [],
    ...useField<{ minCount?: number }, unknown[]>(
      parentName,
      {},
      { absoluteName: true },
    )[0]
  };

  const limitNotReached =
    !disabled && !(parent.minCount >= parent.value.length);

  function onAction(
    event:
      | React.KeyboardEvent<HTMLSpanElement>
      | React.MouseEvent<HTMLSpanElement, MouseEvent>,
  ) {
    if (
      limitNotReached &&
      !readOnly &&
      (!('key' in event) || event.key === 'Enter')
    ) {
      const value = parent.value.slice();
      value.splice(nameIndex, 1);
      parent.onChange(value);
    }
  }

  return (
    <span
      className='autoform__list_del_field'
      {...filterDOMProps(props)}
      onClick={onAction}
      onKeyDown={onAction}
      role="button"
      tabIndex={0}
    >
      <div className='line'></div>
      <TrashIcon />
    </span>


  );
}

export default connectField<ListDelFieldProps>(ListDel, {
  initialValue: false,
  kind: 'leaf',
});
