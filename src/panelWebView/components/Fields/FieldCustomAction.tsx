import * as React from 'react';
import { CustomScript } from '../../../models';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { CodeBracketIcon, CommandLineIcon } from '@heroicons/react/24/solid';
import { CommandToCode } from '../../CommandToCode';
import { LocalizationKey, localize } from '../../../localization';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/shadcn/Dropdown';

export interface IFieldCustomActionProps {
  actions: CustomScript[];
  disabled?: boolean;
  triggerLoading?: (message?: string) => void;
  onChange: (value: any) => void;
}

export const FieldCustomAction: React.FunctionComponent<IFieldCustomActionProps> = ({ actions, disabled, triggerLoading, onChange }: React.PropsWithChildren<IFieldCustomActionProps>) => {

  const triggerAction = React.useCallback((action: CustomScript) => {
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
  }, [triggerLoading, onChange]);

  if (!actions) {
    return null;
  }

  if (actions.length === 1) {
    const action = actions[0];
    return (
      <button
        className="metadata_field__title__action inline-block text-[var(--vscode-editor-foreground)] disabled:opacity-50"
        title={action?.title || localize(LocalizationKey.panelFieldsFieldCustomActionButtonTitle)}
        type="button"
        onClick={triggerAction.bind(null, action)}
        disabled={disabled}
      >
        <span className='sr-only'>{action?.title || localize(LocalizationKey.panelFieldsFieldCustomActionButtonTitle)}</span>
        <CommandLineIcon style={{ height: "16px", width: "16px" }} aria-hidden="true" />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title={localize(LocalizationKey.commonOpenCustomActions)}
        className='metadata_field__title__action inline-block text-[var(--vscode-editor-foreground)] disabled:opacity-50'>
        <span className="sr-only">{localize(LocalizationKey.commonOpenCustomActions)}</span>
        <CommandLineIcon style={{ height: "16px", width: "16px" }} aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='p-0'>
        {
          actions.map((action) => (
            <DropdownMenuItem
              key={action.id || action.title}
              title={action.title}
              className={`focus:bg-[var(--vscode-button-background)] focus:text-[var(--vscode-button-foreground)] focus:outline-0 rounded-none`}
              onClick={(e) => triggerAction(action)}>
              <CommandLineIcon className={`mr-2 h-4 w-4`} aria-hidden={true} />
              <span>{action.title}</span>
            </DropdownMenuItem>
          ))
        }
      </DropdownMenuContent>
    </DropdownMenu>
  )
};