import * as React from 'react';
import { PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../../helpers/MessageHelper';
import { Collapsible } from './Collapsible';
import { BugIcon } from './Icons/BugIcon';
import { CenterIcon } from './Icons/CenterIcon';
import { FileIcon } from './Icons/FileIcon';
import { FolderOpenedIcon } from './Icons/FolderOpenedIcon';
import { SettingsIcon } from './Icons/SettingsIcon';
import { TemplateIcon } from './Icons/TemplateIcon';
import { WritingIcon } from './Icons/WritingIcon';
import { OtherActionButton } from './OtherActionButton';
import { ISSUE_LINK } from '../../constants/Links';

export interface IOtherActionsProps {
  isFile: boolean;
  settings: PanelSettings | undefined;
  isBase?: boolean;
}

const OtherActions: React.FunctionComponent<IOtherActionsProps> = ({isFile, settings, isBase}: React.PropsWithChildren<IOtherActionsProps>) => {

  const openSettings = () => {
    MessageHelper.sendMessage(CommandToCode.openSettings);
  };
  
  const openFile = () => {
    MessageHelper.sendMessage(CommandToCode.openFile);
  };
  
  const openProject = () => {
    MessageHelper.sendMessage(CommandToCode.openProject);
  };
  
  const createAsTemplate = () => {
    MessageHelper.sendMessage(CommandToCode.createTemplate);
  };
  
  const toggleWritingSettings = () => {
    MessageHelper.sendMessage(CommandToCode.toggleWritingSettings);
  };
  
  return (
    <>
      <Collapsible id={`${isBase ? "base_" : ""}other_actions`} title="Other actions" className={`other_actions`}>
        <OtherActionButton className={settings?.writingSettingsEnabled ? "active" : ""} onClick={toggleWritingSettings} disabled={typeof settings?.writingSettingsEnabled === "undefined"}><WritingIcon /> <span>{settings?.writingSettingsEnabled ? "Writing settings enabled" : "Enable writing settings"}</span></OtherActionButton>

        <OtherActionButton onClick={() => MessageHelper.sendMessage(CommandToCode.toggleCenterMode)}>
          <CenterIcon /> <span>Toggle center mode</span>
        </OtherActionButton>

        <OtherActionButton onClick={createAsTemplate} disabled={!isFile}><TemplateIcon /> <span>Create as template</span></OtherActionButton>

        <OtherActionButton onClick={openSettings}><SettingsIcon /> <span>Open settings</span></OtherActionButton>

        <OtherActionButton onClick={openFile} disabled={!isFile}><FileIcon /> <span>Reveal file in folder</span></OtherActionButton>

        <OtherActionButton onClick={openProject}><FolderOpenedIcon /> <span>Reveal project folder</span></OtherActionButton>

        <div className="ext_link_block">
          <a href={ISSUE_LINK} title="Open an issue on GitHub"><BugIcon /> <span>Report an issue</span></a>
        </div>
      </Collapsible>
    </>
  );
};

OtherActions.displayName = 'OtherActions';
export { OtherActions };