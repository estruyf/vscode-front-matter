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
        title="Other actions"
        className={`other_actions`}
      >
        <OtherActionButton
          className={settings?.writingSettingsEnabled ? 'active' : ''}
          onClick={toggleWritingSettings}
          disabled={typeof settings?.writingSettingsEnabled === 'undefined'}
        >
          <WritingIcon />{' '}
          <span>
            {settings?.writingSettingsEnabled
              ? 'Writing settings enabled'
              : 'Enable writing settings'}
          </span>
        </OtherActionButton>

        <OtherActionButton onClick={() => Messenger.send(CommandToCode.toggleCenterMode)}>
          <CenterIcon /> <span>Toggle center mode</span>
        </OtherActionButton>

        <OtherActionButton onClick={createAsTemplate} disabled={!isFile}>
          <TemplateIcon /> <span>Create template</span>
        </OtherActionButton>

        {/* <OtherActionButton onClick={openSettings}><SettingsIcon /> <span>Open settings</span></OtherActionButton> */}

        <OtherActionButton onClick={openFile} disabled={!isFile}>
          <FileIcon /> <span>Reveal file in folder</span>
        </OtherActionButton>

        <OtherActionButton onClick={openProject}>
          <FolderOpenedIcon /> <span>Reveal project folder</span>
        </OtherActionButton>

        <div className="ext_link_block">
          <a href={DOCUMENTATION_LINK} title="Open documentation">
            <BookOpenIcon /> <span>Documentation</span>
          </a>
        </div>

        <div className="ext_link_block">
          <a href={DOCUMENTATION_SETTINGS_LINK} title="Open settings documentation">
            <BookOpenIcon /> <span>Settings overview</span>
          </a>
        </div>

        <div className="ext_link_block">
          <a href={ISSUE_LINK} title="Open an issue on GitHub">
            <BugIcon /> <span>Report an issue</span>
          </a>
        </div>
      </Collapsible>
    </>
  );
};

OtherActions.displayName = 'OtherActions';
export { OtherActions };
