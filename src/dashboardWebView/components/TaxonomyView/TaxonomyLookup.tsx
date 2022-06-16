import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { Page } from '../../models';
import { SettingsSelector } from '../../state';
import { useRecoilValue } from 'recoil';
import { getTaxonomyField } from '../../../helpers/getTaxonomyField';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '../..';

export interface ITaxonomyLookupProps {
  taxonomy: string | null;
  value: string;
  pages: Page[];
}

export const TaxonomyLookup: React.FunctionComponent<ITaxonomyLookupProps> = ({ taxonomy, value, pages }: React.PropsWithChildren<ITaxonomyLookupProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const navigate = useNavigate();

  const total: number | undefined = useMemo(() => {
    if (!taxonomy || !value || !pages || !settings?.contentTypes) {
      return undefined;
    }

    return pages.filter(page => {
      if (taxonomy === "tags") {
        return (page.fmTags || []).includes(value);
      } else if (taxonomy === "categories") {
        return (page.fmCategories || []).includes(value);
      }

      const contentType = settings.contentTypes.find(ct => ct.name === page.fmContentType);

      if (!contentType) {
        return false;
      }
      
      let fieldName = getTaxonomyField(taxonomy, contentType);

      return fieldName && page[fieldName] ? page[fieldName].includes(value) : false;
    }).length;
  }, [taxonomy, value, pages, settings?.contentTypes]);


  const onNavigate = useCallback(() => {
    if (total) {
      navigate(`${routePaths.contents}?taxonomy=${taxonomy}&value=${value}`);
    }
  }, [total, navigate]);

  if (taxonomy === "tags" || taxonomy === "categories") {
    return (
      <button 
        className={total ? `text-teal-900 hover:text-teal-600 font-bold` : ``}
        title={total ? `Show contents with ${value} in ${taxonomy}` : ``}
        onClick={onNavigate}>
        {total || `-`}
      </button>
    );
  }
  
  return (
    <span>
      {total || `-`}
    </span>
  );
};