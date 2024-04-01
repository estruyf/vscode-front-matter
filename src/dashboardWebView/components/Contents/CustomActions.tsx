import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/shadcn/Dropdown';
import { CommandLineIcon } from '@heroicons/react/24/outline';
import { CommandLineIcon as CommandLineIconSolid } from '@heroicons/react/24/solid';
import { runCustomScript } from '../../utils';
import { CustomScript, ScriptType } from '../../../models';
import { LocalizationKey } from '../../../localization';

export interface ICustomActionsProps {
  filePath: string;
  contentType: string;
  scripts: CustomScript[] | undefined;
  showTrigger?: boolean;
}

export const CustomActions: React.FunctionComponent<ICustomActionsProps> = ({
  filePath,
  contentType,
  scripts,
  showTrigger = false,
}: React.PropsWithChildren<ICustomActionsProps>) => {

  const onRunCustomScript = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>, script: CustomScript) => {
      e.stopPropagation();
      runCustomScript(script, filePath);
    },
    [filePath]
  );

  const customScripts = React.useMemo(() => {
    return (scripts || []).filter((script: CustomScript) => {
      if (script.contentTypes && script.contentTypes.length > 0) {
        return script.contentTypes.includes(contentType);
      }

      return true;
    });
  }, [scripts, contentType]);

  const customActions = React.useMemo(() => {
    if (!customScripts || customScripts.length === 0) {
      return null;
    }

    return (
      (customScripts || [])
        .filter(
          (script) =>
            (script.type === undefined || script.type === ScriptType.Content) &&
            !script.bulk &&
            !script.hidden
        )
        .map((script) => (
          <DropdownMenuItem
            key={script.id || script.title}
            title={script.title}
            onClick={(e) => onRunCustomScript(e, script)}>
            <CommandLineIcon className={`mr-2 h-4 w-4`} aria-hidden={true} />
            <span>{script.title}</span>
          </DropdownMenuItem>
        ))
    );
  }, [customScripts, onRunCustomScript]);

  if (!customActions || customActions.length === 0) {
    return null;
  }

  if (showTrigger) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          title={l10n.t(LocalizationKey.commonOpenCustomActions)}
          className='px-2 text-[var(--frontmatter-secondary-text)] hover:text-[var(--frontmatter-button-hoverBackground)] focus-visible:outline-none'>
          <span className="sr-only">{l10n.t(LocalizationKey.commonOpenCustomActions)}</span>
          <CommandLineIconSolid className="w-4 h-4" aria-hidden="true" />
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          {customActions}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return <>{customActions}</>;
};