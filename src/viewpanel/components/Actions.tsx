import * as React from 'react';
import { PanelSettings } from '../../models/PanelSettings';
import { CustomScript } from './CustomScript';
import { DateAction } from './DateAction';
import { PublishAction } from './PublishAction';
import { SlugAction } from './SlugAction';

export interface IActionsProps {
  metadata: any;
  settings: PanelSettings;
}

export const Actions: React.FunctionComponent<IActionsProps> = (props: React.PropsWithChildren<IActionsProps>) => {
  const { metadata, settings } = props;

  if (!metadata || Object.keys(metadata).length === 0 || !settings) {
    return null;
  }

  return (
    <div className={`article__actions`}>
      <h3>Actions</h3>

      { metadata && metadata.title && <SlugAction value={metadata.title} crntValue={metadata.slug} slugOpts={settings.slug} /> }
      
      <DateAction />

      { metadata && typeof metadata.draft !== undefined && <PublishAction draft={metadata.draft} />}

      {
        (settings && settings.scripts && settings.scripts.length > 0) && (
          settings.scripts.map((value) => (
            <CustomScript {...value} />
          ))
        )
      }
    </div>
  );
};