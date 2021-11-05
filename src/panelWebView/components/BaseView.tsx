import * as React from 'react';
import { FolderInfo, PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../../helpers/MessageHelper';
import { Collapsible } from './Collapsible';
import { GlobalSettings } from './GlobalSettings';
import { OtherActions } from './OtherActions';
import { FolderAndFiles } from './FolderAndFiles';
import { SponsorMsg } from './SponsorMsg';

export interface IBaseViewProps {
  settings: PanelSettings | undefined;
  folderAndFiles: FolderInfo[] | undefined;
}

const BaseView: React.FunctionComponent<IBaseViewProps> = ({settings, folderAndFiles}: React.PropsWithChildren<IBaseViewProps>) => {
  
  const openDashboard = () => {
    MessageHelper.sendMessage(CommandToCode.openDashboard);
  };
  
  const initProject = () => {
    MessageHelper.sendMessage(CommandToCode.initProject);
  };
  
  const createContent = () => {
    MessageHelper.sendMessage(CommandToCode.createContent);
  };

  const openPreview = () => {
    MessageHelper.sendMessage(CommandToCode.openPreview);
  };

  return (
    <div className="frontmatter">
      <div className={`ext_actions`}>
        <GlobalSettings settings={settings} isBase />
        
        <Collapsible id={`base_actions`} title="Actions">
          <div className={`base__actions`}>
            <button onClick={openDashboard}>Open dashboard</button>
            <button onClick={initProject} disabled={settings?.isInitialized}>Initialize project</button>
            <button onClick={createContent} disabled={!settings?.isInitialized}>Create new content</button>
            <button onClick={openPreview} disabled={!settings?.preview?.host}>Open site preview</button>
          </div>
        </Collapsible>
        
        <FolderAndFiles data={folderAndFiles} isBase />

        <OtherActions settings={settings} isFile={false} isBase />
      </div>

      <SponsorMsg />
    </div>
  );
};

BaseView.displayName = 'BaseView';
export { BaseView };