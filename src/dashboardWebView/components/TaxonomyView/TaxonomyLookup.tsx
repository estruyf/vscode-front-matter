import * as React from 'react';
import { useMemo } from 'react';
import { Page } from '../../models';
import { SettingsSelector } from '../../state';
import { useRecoilValue } from 'recoil';
import { getTaxonomyField } from '../../../helpers/getTaxonomyField';

export interface ITaxonomyLookupProps {
  taxonomy: string | null;
  value: string;
  pages: Page[];
}

export const TaxonomyLookup: React.FunctionComponent<ITaxonomyLookupProps> = ({ taxonomy, value, pages }: React.PropsWithChildren<ITaxonomyLookupProps>) => {
  const settings = useRecoilValue(SettingsSelector);

  const total = useMemo(() => {
    if (!taxonomy || !value || !pages || !settings?.contentTypes) {
      return <>-</>;
    }

    return pages.filter(page => {
      const contentType = settings.contentTypes.find(ct => ct.name === page.fmContentType);

      if (!contentType) {
        return false;
      }
      
      let fieldName = getTaxonomyField(taxonomy, contentType);

      return fieldName && page[fieldName] ? page[fieldName].includes(value) : false;
    }).length;
  }, [taxonomy, value, pages, settings?.contentTypes]);
  
  return (
    <span className={``}>
      {total}
    </span>
  );
};