import * as React from 'react';
import { useForm } from 'uniforms';
import { SubmitField } from 'uniforms-unstyled';

export interface IDataBlockControlsProps {
  model: any | null;
  onClear: () => void;
}

export const DataBlockControls: React.FunctionComponent<IDataBlockControlsProps> = ({ model, onClear }: React.PropsWithChildren<IDataBlockControlsProps>) => {
  const { formRef } = useForm();
  
  return (
    <div className='json_data__buttons'>
      <SubmitField value={model ? `Update` : `Add`} />
      
      <button className='ml-4' onClick={() => {
        if (onClear) {
          onClear();
        }
        formRef.reset();
      }}>Cancel</button>
    </div>
  );
};