import * as React from 'react';
import { CustomScript } from '../../../models';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import { CommandToCode } from '../../CommandToCode';
import { LocalizationKey, localize } from '../../../localization';

export interface IFieldCustomActionProps {
  action: CustomScript;
  disabled?: boolean;
  triggerLoading?: (message?: string) => void;
  onChange: (value: any) => void;
}

export const FieldCustomAction: React.FunctionComponent<IFieldCustomActionProps> = ({ action, disabled, triggerLoading, onChange }: React.PropsWithChildren<IFieldCustomActionProps>) => {
  return (
    <button
      className="metadata_field__title__action inline-block text-[var(--vscode-editor-foreground)] disabled:opacity-50"
      title={action?.title || localize(LocalizationKey.panelFieldsFieldCustomActionButtonTitle)}
      type="button"
      onClick={() => {
        if (triggerLoading) {
          triggerLoading(localize(LocalizationKey.panelFieldsFieldCustomActionExecuting));
        }

        messageHandler.request(CommandToCode.runFieldAction, {
          ...action
        }).then((value: any) => {
          onChange(value);

          if (triggerLoading) {
            triggerLoading();
          }
        }).catch(() => {
          console.error('Error while running the custom action');

          if (triggerLoading) {
            triggerLoading();
          }
        });
      }}
      disabled={disabled}
    >
      <span className='sr-only'>{action?.title || localize(LocalizationKey.panelFieldsFieldCustomActionButtonTitle)}</span>
      <CodeBracketIcon style={{ height: "16px", width: "16px" }} aria-hidden="true" />
    </button>
  );
};