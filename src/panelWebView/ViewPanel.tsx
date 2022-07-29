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
import { FeatureFlag } from '../components/features/FeatureFlag';
import { FEATURE_FLAG } from '../constants/Features';
import { GitAction } from './components/Git/GitAction';

export interface IViewPanelProps {
}

export const ViewPanel: React.FunctionComponent<IViewPanelProps> = (props: React.PropsWithChildren<IViewPanelProps>) => {
  const { loading, mediaSelecting, metadata, settings, folderAndFiles, focusElm, unsetFocus, mode } = useMessages();
  
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
      <BaseView mode={mode} settings={settings} folderAndFiles={folderAndFiles} />
    );
  }

  return (
    <div className="frontmatter">      
      <div className={`ext_actions`}>
        <GitAction settings={settings} />

        <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.globalSettings}>
          <GlobalSettings settings={settings} />
        </FeatureFlag>

        {
          settings && settings.seo && (
            <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.seo}>
              <SeoStatus 
                seo={settings.seo} 
                data={metadata}
                focusElm={focusElm}
                unsetFocus={unsetFocus} />
            </FeatureFlag>
          )
        }
        {
          settings && metadata && (
            <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.actions}>
              <Actions metadata={metadata} settings={settings} />
            </FeatureFlag>
          )
        }


        <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.metadata}>
          <Metadata
            settings={settings}
            metadata={metadata}
            focusElm={focusElm}
            unsetFocus={unsetFocus}
            features={mode?.features || []} />
        </FeatureFlag>

        <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.recentlyModified}>
          <FolderAndFiles data={folderAndFiles} />
        </FeatureFlag>

        <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.panel.otherActions}>
          <OtherActions settings={settings} isFile={true} />
        </FeatureFlag>
      </div>

      <SponsorMsg isBacker={settings?.isBacker} />
    </div>
  );
};