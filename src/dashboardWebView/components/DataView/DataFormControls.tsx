import * as React from 'react';
import { useForm } from 'uniforms';
import { Button } from '../Common/Button';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { SubmitField } from '../../../components/uniforms-frontmatter';

export interface IDataFormControlsProps {
  model: any | null;
  onClear: () => void;
}

export const DataFormControls: React.FunctionComponent<IDataFormControlsProps> = ({
  model,
  onClear
}: React.PropsWithChildren<IDataFormControlsProps>) => {
  const { formRef } = useForm();

  return (
    <div className={`text-right border-[var(--frontmatter-border)]`}>
      <SubmitField value={model ? `Update` : `Add`} />

      <Button
        className="ml-4"
        secondary
        onClick={() => {
          if (onClear) {
            onClear();
          }
          formRef.reset();
        }}
      >
        {l10n.t(LocalizationKey.commonCancel)}
      </Button>
    </div>
  );
};
