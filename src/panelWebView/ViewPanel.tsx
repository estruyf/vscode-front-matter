import * as React from 'react';
import { Actions } from './components/Actions';
import { BaseView } from './components/BaseView';
import { GlobalSettings } from './components/GlobalSettings';
import { OtherActions } from './components/OtherActions';
import { SeoStatus } from './components/SeoStatus';
import { Spinner } from './components/Spinner';
import { FolderAndFiles } from './components/FolderAndFiles';
import { Metadata } from './components/Metadata';
import { SponsorMsg } from './components/SponsorMsg';
import useMessages from './hooks/useMessages';

export interface IViewPanelProps {
}

export const ViewPanel: React.FunctionComponent<IViewPanelProps> = (props: React.PropsWithChildren<IViewPanelProps>) => {
  const { loading, mediaSelecting, metadata, settings, folderAndFiles, focusElm, unsetFocus } = useMessages();

  if (mediaSelecting) {
    return (
      <div className="frontmatter media_selection">
        <h1>Continue in the media dashboard to select the image you want to insert.</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <Spinner />
    );
  }

  if (!metadata || Object.keys(metadata || {}).length === 0) {
    return (
      <BaseView settings={settings} folderAndFiles={folderAndFiles} />
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

        <Metadata
          settings={settings}
          metadata={metadata}
          focusElm={focusElm}
          unsetFocus={unsetFocus} />

        <FolderAndFiles data={folderAndFiles} />

        <OtherActions settings={settings} isFile={true} />
      </div>

      <SponsorMsg />
    </div>
  );
};