import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../../DashboardMessage';
import { AstroCollection } from '../../../../models';
import { Settings } from '../../../models';
import { SelectItem } from '../../Steps/SelectItem';
import { LocalizationKey } from '../../../../localization';

export interface IAstroContentTypesProps {
  settings: Settings
  triggerLoading: (isLoading: boolean) => void;
}

export const AstroContentTypes: React.FunctionComponent<IAstroContentTypesProps> = ({
  settings,
  triggerLoading
}: React.PropsWithChildren<IAstroContentTypesProps>) => {
  const [collections, setCollections] = React.useState<AstroCollection[]>([]);

  React.useEffect(() => {
    triggerLoading(true);
    messageHandler.request<AstroCollection[]>(DashboardMessage.ssgGetAstroContentTypes).then((result) => {
      triggerLoading(false);
      setCollections(result);
    });
  }, []);

  const generateContentType = (collection: AstroCollection) => {
    triggerLoading(true);
    messageHandler.request(DashboardMessage.ssgSetAstroContentTypes, {
      collection
    }).then((result) => {
      triggerLoading(false);
    });
  }

  if (!collections || collections.length === 0) {
    return (
      <div className='mt-1'>
        {l10n.t(LocalizationKey.dashboardConfigurationAstroAstroContentTypesEmpty)}
      </div>
    );
  }

  return (
    <div className='mt-1'>
      <p>{l10n.t(LocalizationKey.dashboardConfigurationAstroAstroContentTypesDescription)}</p>

      <div className='mt-2'>
        {
          (collections || []).map((collection) => {
            const ct = settings.contentTypes.find((c) => c.name === collection.name);

            return (
              <SelectItem
                key={collection.name}
                title={collection.name}
                buttonTitle={collection.name}
                isSelected={ct !== undefined}
                onClick={() => generateContentType(collection)}
                disabled={ct !== undefined} />
            )
          })
        }
      </div>
    </div>
  );
};