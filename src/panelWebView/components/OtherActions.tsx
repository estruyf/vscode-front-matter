import * as React from 'react';
import { PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { Collapsible } from './Collapsible';
import { BugIcon } from './Icons/BugIcon';
import { CenterIcon } from './Icons/CenterIcon';
import { FileIcon } from './Icons/FileIcon';
import { FolderOpenedIcon } from './Icons/FolderOpenedIcon';
import { TemplateIcon } from './Icons/TemplateIcon';
import { WritingIcon } from './Icons/WritingIcon';
import { OtherActionButton } from './OtherActionButton';
import { DOCUMENTATION_LINK, DOCUMENTATION_SETTINGS_LINK, ISSUE_LINK } from '../../constants/Links';
import { Messenger } from '@estruyf/vscode/dist/client';
import { BookOpenIcon } from '@heroicons/react/outline';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export interface IOtherActionsProps {
  isFile: boolean;
  settings: PanelSettings | undefined;
  isBase?: boolean;
}

const OtherActions: React.FunctionComponent<IOtherActionsProps> = ({
  isFile,
  settings,
  isBase
}: React.PropsWithChildren<IOtherActionsProps>) => {
  const openSettings = () => {
    Messenger.send(CommandToCode.openSettings);
  };

  const openFile = () => {
    Messenger.send(CommandToCode.openFile);
  };

  const openProject = () => {
    Messenger.send(CommandToCode.openProject);
  };

  const createAsTemplate = () => {
    Messenger.send(CommandToCode.createTemplate);
  };

  const toggleWritingSettings = () => {
    Messenger.send(CommandToCode.toggleWritingSettings);
  };

  return (
    <>
      <Collapsible
        id={`${isBase ? 'base_' : ''}other_actions`}
        title={l10n.t(LocalizationKey.panelOtherActionsTitle)}
        className={`other_actions`}
      >
        <OtherActionButton
          className={settings?.writingSettingsEnabled ? 'active' : ''}
          onClick={toggleWritingSettings}
          disabled={typeof settings?.writingSettingsEnabled === 'undefined'}
        >
          <WritingIcon />{' '}
          <span>
            {
              settings?.writingSettingsEnabled
                ? l10n.t(LocalizationKey.panelOtherActionsWritingSettingsEnabled)
                : l10n.t(LocalizationKey.panelOtherActionsWritingSettingsDisabled)
            }
          </span>
        </OtherActionButton>

        <OtherActionButton onClick={() => Messenger.send(CommandToCode.toggleCenterMode)}>
          <CenterIcon /> <span>{l10n.t(LocalizationKey.panelOtherActionsCenterMode)}</span>
        </OtherActionButton>

        <OtherActionButton onClick={createAsTemplate} disabled={!isFile}>
          <TemplateIcon /> <span>{l10n.t(LocalizationKey.panelOtherActionsCreateTemplate)}</span>
        </OtherActionButton>

        {/* <OtherActionButton onClick={openSettings}><SettingsIcon /> <span>Open settings</span></OtherActionButton> */}

        <OtherActionButton onClick={openFile} disabled={!isFile}>
          <FileIcon /> <span>{l10n.t(LocalizationKey.panelOtherActionsRevealFile)}</span>
        </OtherActionButton>

        <OtherActionButton onClick={openProject}>
          <FolderOpenedIcon /> <span>{l10n.t(LocalizationKey.panelOtherActionsOpenProject)}</span>
        </OtherActionButton>

        <div className="ext_link_block">
          <a href={DOCUMENTATION_LINK} title={l10n.t(LocalizationKey.panelOtherActionsDocumentation)}>
            <BookOpenIcon /> <span>{l10n.t(LocalizationKey.panelOtherActionsDocumentation)}</span>
          </a>
        </div>

        <div className="ext_link_block">
          <a href={DOCUMENTATION_SETTINGS_LINK} title={l10n.t(LocalizationKey.panelOtherActionsSettings)}>
            <BookOpenIcon /> <span>{l10n.t(LocalizationKey.panelOtherActionsSettings)}</span>
          </a>
        </div>

        <div className="ext_link_block">
          <a href={ISSUE_LINK} title={l10n.t(LocalizationKey.panelOtherActionsIssue)}>
            <BugIcon /> <span>{l10n.t(LocalizationKey.panelOtherActionsIssue)}</span>
          </a>
        </div>
      </Collapsible>
    </>
  );
};

OtherActions.displayName = 'OtherActions';
export { OtherActions };
