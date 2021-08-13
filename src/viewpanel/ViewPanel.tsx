import * as React from 'react';
import { Actions } from './components/Actions';
import { BaseView } from './components/BaseView';
import { Collapsible } from './components/Collapsible';
import { GlobalSettings } from './components/GlobalSettings';
import { ListUnorderedIcon } from './components/Icons/ListUnorderedIcon';
import { SymbolKeywordIcon } from './components/Icons/SymbolKeywordIcon';
import { TagIcon } from './components/Icons/TagIcon';
import { OtherActions } from './components/OtherActions';
import { SeoStatus } from './components/SeoStatus';
import { Spinner } from './components/Spinner';
import { TagPicker } from './components/TagPicker';
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
      <BaseView settings={settings} />
    );
  }

  return (
    <div className="frontmatter">
      <div className={`ext_actions`}>
        <GlobalSettings settings={settings} />

        {
          settings && settings.seo && <SeoStatus seo={settings.seo} data={metadata} />
        }
        {
          settings && metadata && <Actions metadata={metadata} settings={settings} />
        }

        <Collapsible id={`tags`} title="Metadata" className={`inherit z-20`}>
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

        <OtherActions settings={settings} isFile={true} />
      </div>
    </div>
  );
};