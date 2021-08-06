import * as React from 'react';
import { CommandToCode } from './CommandToCode';
import { Actions } from './components/Actions';
import { BaseView } from './components/BaseView';
import { Collapsible } from './components/Collapsible';
import { BugIcon } from './components/Icons/BugIcon';
import { FileIcon } from './components/Icons/FileIcon';
import { FolderOpenedIcon } from './components/Icons/FolderOpenedIcon';
import { ListUnorderedIcon } from './components/Icons/ListUnorderedIcon';
import { SettingsIcon } from './components/Icons/SettingsIcon';
import { SymbolKeywordIcon } from './components/Icons/SymbolKeywordIcon';
import { TagIcon } from './components/Icons/TagIcon';
import { SeoStatus } from './components/SeoStatus';
import { Spinner } from './components/Spinner';
import { TagPicker } from './components/TagPicker';
import { MessageHelper } from './helper/MessageHelper';
import useMessages from './hooks/useMessages';
import { TagType } from './TagType';

export interface IViewPanelProps {
}

export const ViewPanel: React.FunctionComponent<IViewPanelProps> = (props: React.PropsWithChildren<IViewPanelProps>) => {
  const { loading, metadata, settings, focusElm, unsetFocus } = useMessages();

  if (loading) {
    return (
      <Spinner />
    );
  }

  if (!metadata || Object.keys(metadata).length === 0) {
    return (
      <BaseView />
    );
  }

  const openSettings = () => {
    MessageHelper.sendMessage(CommandToCode.openSettings);
  };
  
  const openFile = () => {
    MessageHelper.sendMessage(CommandToCode.openFile);
  };
  
  const openProject = () => {
    MessageHelper.sendMessage(CommandToCode.openProject);
  };

  return (
    <div className="frontmatter">
      <div className={`ext_actions`}>
        {
          settings && settings.seo && <SeoStatus seo={settings.seo} data={metadata} />
        }
        {
          settings && metadata && <Actions metadata={metadata} settings={settings} />
        }

        <Collapsible title="Metadata" className={`absolute w-full`}>
          {
            <TagPicker type={TagType.keywords} 
                       icon={<SymbolKeywordIcon />}
                       crntSelected={metadata.keywords || []} 
                       options={[]} 
                       freeform={true} 
                       focussed={focusElm === TagType.keywords}
                       unsetFocus={unsetFocus}
                       disableConfigurable />
          }
          {
            (settings && settings.tags && settings.tags.length > 0) && (
              <TagPicker type={TagType.tags} 
                        icon={<TagIcon />}
                        crntSelected={metadata.tags || []} 
                        options={settings.tags} 
                        freeform={settings.freeform} 
                        focussed={focusElm === TagType.tags}
                        unsetFocus={unsetFocus} />
            )
          }
          {
            (settings && settings.categories && settings.categories.length > 0) && (
              <TagPicker type={TagType.categories}
                        icon={<ListUnorderedIcon />}
                        crntSelected={metadata.categories || []} 
                        options={settings.categories} 
                        freeform={settings.freeform} 
                        focussed={focusElm === TagType.categories}
                        unsetFocus={unsetFocus} />
            )
          }
        </Collapsible>
      </div>

      <div className={`ext_settings`}>
        <div className="ext_link_block">
          <button onClick={openSettings}><SettingsIcon /> Open settings</button>
        </div>

        <div className="ext_link_block">
          <button onClick={openFile}><FileIcon /> Reveal file in folder</button>
        </div>

        <div className="ext_link_block">
          <button onClick={openProject}><FolderOpenedIcon /> Reveal project folder</button>
        </div>

        <div className="ext_link_block">
          <a href="https://github.com/estruyf/vscode-front-matter/issues" title="Open an issue on GitHub"><BugIcon /> Report an issue</a>
        </div>
      </div>
    </div>
  );
};