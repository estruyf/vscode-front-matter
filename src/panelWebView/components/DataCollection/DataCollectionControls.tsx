import * as React from 'react';
import { useForm } from 'uniforms';
import { SubmitField } from 'uniforms-unstyled';

export interface IDataCollectionControlsProps {
  model: any | null;
  onClear: () => void;
}

export const DataCollectionControls: React.FunctionComponent<IDataCollectionControlsProps> = ({ model, onClear }: React.PropsWithChildren<IDataCollectionControlsProps>) => {
  const { formRef } = useForm();
  
  return (
    <div className='data_controls__buttons'>
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