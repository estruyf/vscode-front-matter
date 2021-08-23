import * as React from 'react';
import { PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../helper/MessageHelper';
import { Collapsible } from './Collapsible';
import { GlobalSettings } from './GlobalSettings';
import { OtherActions } from './OtherActions';
import { FileList } from './FileList';

export interface IBaseViewProps {
  settings: PanelSettings | undefined;
}

export const BaseView: React.FunctionComponent<IBaseViewProps> = ({settings}: React.PropsWithChildren<IBaseViewProps>) => {
  
  const initProject = () => {
    MessageHelper.sendMessage(CommandToCode.initProject);
  };
  
  const createContent = () => {
    MessageHelper.sendMessage(CommandToCode.createContent);
  };


  return (
    <div className="frontmatter">
      <div className={`ext_actions`}>
        <GlobalSettings settings={settings} isBase />
        
        <Collapsible id={`base_actions`} title="Actions">
          <div className={`base__actions`}>
            <button onClick={initProject} disabled={settings?.isInitialized}>Initialize project</button>
            <button onClick={createContent} disabled={!settings?.isInitialized}>Create new content</button>
          </div>
        </Collapsible>

        {
          settings?.contentInfo && (
            <Collapsible id={`base_content`} title="Content information">
              <div className="base__information">
                {
                  settings.contentInfo.map(folder => (
                    <div key={folder.title}>
                      {folder.title}: {folder.files} file{folder.files > 1 ? 's' : ''}

                      {
                        folder.lastModified ? <FileList files={folder.lastModified} /> : null
                      }
                    </div>
                  ))
                }
              </div>
            </Collapsible>
          )
        }

        <OtherActions settings={settings} isFile={false} isBase />
      </div>
    </div>
  );
};