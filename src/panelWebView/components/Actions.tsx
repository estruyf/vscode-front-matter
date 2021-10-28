import * as React from 'react';
import { PanelSettings } from '../../models/PanelSettings';
import { Collapsible } from './Collapsible';
import { CustomScript } from './CustomScript';
import { Preview } from './Preview';
import { SlugAction } from './SlugAction';

export interface IActionsProps {
  metadata: any;
  settings: PanelSettings;
}

const Actions: React.FunctionComponent<IActionsProps> = (props: React.PropsWithChildren<IActionsProps>) => {
  const { metadata, settings } = props;

  if (!metadata || Object.keys(metadata).length === 0 || !settings) {
    return null;
  }

  return (
    <Collapsible id={`actions`} title="Actions">
      <div className={`article__actions`}>

        { metadata && metadata.title && <SlugAction value={metadata.title} crntValue={metadata.slug} slugOpts={settings.slug} /> }

        { settings?.preview?.host && <Preview slug={metadata.slug} /> }

        {
          (settings && settings.scripts && settings.scripts.length > 0) && (
            settings.scripts.map((value, idx) => (
              <CustomScript key={value?.title?.replace(/ /g, '') || idx} {...value} />
            ))
          )
        }
      </div>
    </Collapsible>
  );
};

Actions.displayName = 'Actions';
export { Actions };