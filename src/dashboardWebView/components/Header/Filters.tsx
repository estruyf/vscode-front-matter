import * as React from 'react';
import { FoldersFilter } from './FoldersFilter';
import { Filter } from './Filter';
import { useRecoilState, useRecoilValue } from 'recoil';
import { CategoryAtom, SettingsSelector, TagAtom, FiltersAtom, FilterValuesAtom } from '../../state';
import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { firstToUpper } from '../../../helpers/StringHelpers';
import { LanguageFilter } from '../Filters/LanguageFilter';

export interface IFiltersProps { }

export const Filters: React.FunctionComponent<IFiltersProps> = (_: React.PropsWithChildren<IFiltersProps>) => {
  const [crntFilters, setCrntFilters] = useRecoilState(FiltersAtom);
  const [crntTag, setCrntTag] = useRecoilState(TagAtom);
  const [crntCategory, setCrntCategory] = useRecoilState(CategoryAtom);
  const filterValues = useRecoilValue(FilterValuesAtom);
  const settings = useRecoilValue(SettingsSelector);
  const location = useLocation();

  const otherFilters = useMemo(() => settings?.filters?.filter((filter) => filter !== "contentFolders" && filter !== "tags" && filter !== "categories"), [settings?.filters]);

  const otherFilterValues = useMemo(() => {
    return otherFilters?.map((filter) => {
      const filterName = typeof filter === "string" ? filter : filter.name;
      const filterTitle = typeof filter === "string" ? firstToUpper(filter) : filter.title;
      const values = filterValues?.[filterName];
      if (!values || values.length === 0) {
        return null;
      }

      return (
        <Filter
          key={filterName}
          label={filterTitle}
          activeItem={crntFilters[filterName]}
          items={values}
          onClick={(value) => setCrntFilters((prev) => {
            const clone = Object.assign({}, prev);
            if (!clone[filterName] && value) {
              clone[filterName] = value;
            } else {
              clone[filterName] = value || "";
            }
            return clone;
          })}
        />
      )
    })
  }, [otherFilters, crntFilters, filterValues, setCrntFilters]);

  useEffect(() => {
    if (location.search) {
      const searchParams = new URLSearchParams(location.search);
      const taxonomy = searchParams.get('taxonomy');
      const value = searchParams.get('value');

      if (taxonomy && value) {
        if (taxonomy === 'tags') {
          setCrntTag(value);
        } else if (taxonomy === 'categories') {
          setCrntCategory(value);
        }
      }

      return;
    }

    setCrntFilters({});

    setCrntTag('');
    setCrntCategory('');
  }, [location.search]);

  return (
    <>
      <LanguageFilter />

      {
        settings?.filters?.includes("contentFolders") && (
          <FoldersFilter />
        )
      }

      {
        settings?.filters?.includes("tags") && (
          <Filter
            label={`Tag`}
            activeItem={crntTag}
            items={settings?.tags || []}
            onClick={(value) => setCrntTag(value)}
          />
        )
      }

      {
        settings?.filters?.includes("categories") && (
          <Filter
            label={`Category`}
            activeItem={crntCategory}
            items={settings?.categories || []}
            onClick={(value) => setCrntCategory(value)}
          />
        )
      }

      {otherFilterValues}
    </>
  );
};