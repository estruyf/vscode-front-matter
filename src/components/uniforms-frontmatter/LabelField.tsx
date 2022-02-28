import * as React from 'react';
import { ReactNode } from 'react';
import './LabelField.css';

export interface ILabelFieldProps {
  id: string;
  label: string | ReactNode;
  required?: boolean;
}

export const LabelField: React.FunctionComponent<ILabelFieldProps> = ({ label, id, required }: React.PropsWithChildren<ILabelFieldProps>) => {
  return (
    label ? (
      <label className="autoform__label" htmlFor={id}>
        {label}
        {required && <span title='Required field' className='autoform__label__required'>*</span>}
      </label>
    ) : null
  );
};