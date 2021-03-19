import * as React from 'react';
import { CommandToCode } from './CommandToCode';
import { Actions } from './components/Actions';
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
      <div className="frontmatter">
        <p>Current view/file is not supported by FrontMatter.</p>
      </div>
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
      {
        settings && settings.seo && <SeoStatus seo={settings.seo} data={metadata} />
      }
      {
        settings && metadata && <Actions metadata={metadata} settings={settings} />
      }
      {
        (settings && settings.tags && settings.tags.length > 0) && (
          <TagPicker type={TagType.tags} 
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
                     crntSelected={metadata.categories || []} 
                     options={settings.categories} 
                     freeform={settings.freeform} 
                     focussed={focusElm === TagType.categories}
                     unsetFocus={unsetFocus} />
        )
      }

      <div className="ext_link_block">
        <a href="javascript:;" onClick={openSettings}>Open settings</a>
      </div>

      <div className="ext_link_block">
        <a href="javascript:;" onClick={openFile}>Reveal file in folder</a>
      </div>

      <div className="ext_link_block">
        <a href="javascript:;" onClick={openProject}>Reveal project folder</a>
      </div>

      <div className="ext_link_block">
        <a href="https://github.com/estruyf/vscode-front-matter/issues" title="Open an issue on GitHub">Report an issue</a>
      </div>
    </div>
  );
};