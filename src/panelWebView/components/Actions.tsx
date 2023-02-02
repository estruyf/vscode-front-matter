import * as React from 'react';
import { PanelSettings } from '../../models/PanelSettings';
import { Collapsible } from './Collapsible';
import { CustomScript } from './CustomScript';
import { Preview } from './Preview';
import { SlugAction } from './SlugAction';
import { StartServerButton } from './StartServerButton';

export interface IActionsProps {
  metadata: any;
  settings: PanelSettings;
}

const Actions: React.FunctionComponent<IActionsProps> = ({
  metadata,
  settings
}: React.PropsWithChildren<IActionsProps>) => {
  if (!metadata || Object.keys(metadata).length === 0 || !settings) {
    return null;
  }

  return (
    <Collapsible id={`actions`} title="Actions">
      <div className={`article__actions`}>
        {metadata && metadata.title && <SlugAction />}

        {settings?.preview?.host && <Preview slug={metadata.slug} />}

        <StartServerButton settings={settings} />

        {settings && settings.scripts && settings.scripts.length > 0 && (
          <>
            <div className="divider py-4 w-full" style={{ height: `1px` }}></div>

            {settings.scripts.map((value, idx) => (
              <CustomScript key={value?.title?.replace(/ /g, '') || idx} {...value} />
            ))}
          </>
        )}
      </div>
    </Collapsible>
  );
};

Actions.displayName = 'Actions';
export { Actions };
