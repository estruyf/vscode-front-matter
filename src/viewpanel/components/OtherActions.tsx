import * as React from 'react';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../helper/MessageHelper';
import { Collapsible } from './Collapsible';
import { BugIcon } from './Icons/BugIcon';
import { FileIcon } from './Icons/FileIcon';
import { FolderOpenedIcon } from './Icons/FolderOpenedIcon';
import { SettingsIcon } from './Icons/SettingsIcon';
import { TemplateIcon } from './Icons/TemplateIcon';

export interface IOtherActionsProps {
  isFile: boolean;
}

export const OtherActions: React.FunctionComponent<IOtherActionsProps> = ({isFile}: React.PropsWithChildren<IOtherActionsProps>) => {

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
  
  return (
    <>
      <Collapsible title="Other actions" className={`other_actions`}>
        <div className="ext_link_block">
          <button onClick={createAsTemplate} disabled={!isFile}><TemplateIcon /> Create as template</button>
        </div>

        <div className="ext_link_block">
          <button onClick={openSettings}><SettingsIcon /> Open settings</button>
        </div>

        <div className="ext_link_block">
          <button onClick={openFile} disabled={!isFile}><FileIcon /> Reveal file in folder</button>
        </div>

        <div className="ext_link_block">
          <button onClick={openProject}><FolderOpenedIcon /> Reveal project folder</button>
        </div>

        <div className="ext_link_block">
          <a href="https://github.com/estruyf/vscode-front-matter/issues" title="Open an issue on GitHub"><BugIcon /> Report an issue</a>
        </div>
      </Collapsible>
    </>
  );
};