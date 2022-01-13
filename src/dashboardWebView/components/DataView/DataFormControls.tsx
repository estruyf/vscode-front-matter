import * as React from 'react';
import { useForm } from 'uniforms';
import { SubmitField } from 'uniforms-unstyled';
import { Button } from '../Button';

export interface IDataFormControlsProps {
  model: any | null;
  onClear: () => void;
}

export const DataFormControls: React.FunctionComponent<IDataFormControlsProps> = ({ model, onClear }: React.PropsWithChildren<IDataFormControlsProps>) => {
  const { formRef } = useForm();
  
  return (
    <div className='text-right'>
      <SubmitField value={model ? `Update` : `Add`} />
      <Button className='ml-4' secondary onClick={() => {
        if (onClear) {
          onClear();
        }
        formRef.reset();
      }}>Cancel</Button>
    </div>
  );
};