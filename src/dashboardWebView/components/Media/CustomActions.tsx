import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/shadcn/Dropdown';
import { CustomScript, ScriptType } from '../../../models';
import { runCustomScript } from '../../utils';
import { CommandLineIcon } from '@heroicons/react/24/outline';
import { CommandLineIcon as CommandLineIconSolid } from '@heroicons/react/24/solid';
import { LocalizationKey } from '../../../localization';

export interface ICustomActionsProps {
  filePath: string;
  scripts?: CustomScript[];
  showTrigger?: boolean;
}

export const CustomActions: React.FunctionComponent<ICustomActionsProps> = ({
  filePath,
  scripts,
  showTrigger = false,
}: React.PropsWithChildren<ICustomActionsProps>) => {

  const customActions = React.useMemo(() => {
    return (scripts || [])
      .filter((script) => script.type === ScriptType.MediaFile && !script.hidden)
      .map((script) => (
        <DropdownMenuItem
          key={script.title}
          onClick={() => runCustomScript(script, filePath)}
        >
          <CommandLineIcon className="mr-2 h-4 w-4" aria-hidden={true} />
          <span>{script.title}</span>
        </DropdownMenuItem>
      ));
  }, [scripts]);

  if (!customActions.length) {
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