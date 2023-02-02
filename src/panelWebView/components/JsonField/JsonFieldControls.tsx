import * as React from 'react';
import { useForm } from 'uniforms';
import { SubmitField } from 'uniforms-unstyled';

export interface IJsonFieldControlsProps {
  model: any | null;
  onClear: () => void;
}

export const JsonFieldControls: React.FunctionComponent<IJsonFieldControlsProps> = ({
  model,
  onClear
}: React.PropsWithChildren<IJsonFieldControlsProps>) => {
  const { formRef } = useForm();

  return (
    <div className="json_data__buttons">
      <SubmitField value={model ? `Update` : `Add`} />

      <button
        className="ml-4"
        onClick={() => {
          if (onClear) {
            onClear();
          }
          formRef.reset();
        }}
      >
        Cancel
      </button>
    </div>
  );
};
