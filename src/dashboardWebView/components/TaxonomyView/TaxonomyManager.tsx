import { Messenger } from '@estruyf/vscode/dist/client';
import { ExclamationTriangleIcon, PlusIcon, TagIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { TaxonomyData } from '../../../models';
import { DashboardMessage } from '../../DashboardMessage';
import { Page } from '../../models';
import { SettingsSelector } from '../../state';
import { getTaxonomyField } from '../../../helpers/getTaxonomyField';
import { TaxonomyActions } from './TaxonomyActions';
import { TaxonomyLookup } from './TaxonomyLookup';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { FilterInput } from './FilterInput';
import { useDebounce } from '../../../hooks/useDebounce';
import { usePrevious } from '../../../panelWebView/hooks/usePrevious';

export interface ITaxonomyManagerProps {
  data: TaxonomyData | undefined;
  taxonomy: string | null;
  pages: Page[];
  onContentTagging: (value: string) => void;
}

export const TaxonomyManager: React.FunctionComponent<ITaxonomyManagerProps> = ({
  data,
  taxonomy,
  pages,
  onContentTagging
}: React.PropsWithChildren<ITaxonomyManagerProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const [filterValue, setFilterValue] = React.useState('');
  const debounceFilterValue = useDebounce<string>(filterValue, 500);
  const prevTaxonomy = usePrevious<string | null>(taxonomy);

  const onCreate = () => {
    Messenger.send(DashboardMessage.createTaxonomy, {
      type: taxonomy
    });
  };

  const items = useMemo(() => {
    if (data && taxonomy) {
      let crntItems: string[] = [];

      if (taxonomy === 'tags' || taxonomy === 'categories') {
        crntItems = data[taxonomy];
      } else {
        crntItems = data.customTaxonomy.find((c) => c.id === taxonomy)?.options || [];
      }

      // Only allow string values
      crntItems = crntItems.filter((i) => typeof i === 'string');

      // Alphabetically sort the items
      crntItems = Object.assign([], crntItems).sort((a: string, b: string) => {
        a = a || '';
        b = b || '';

        if (a.toLowerCase() < b.toLowerCase()) {
          return -1;
        }

        if (a.toLowerCase() > b.toLowerCase()) {
          return 1;
        }

        return 0;
      });

      if (debounceFilterValue) {
        crntItems = crntItems.filter((i) => i.toLowerCase().includes(debounceFilterValue.toLowerCase()));
      }

      return crntItems.filter(i => i);
    }

    return [];
  }, [data, taxonomy, debounceFilterValue]);

  const unmappedItems = useMemo(() => {
    const unmapped: string[] = [];

    if (!pages || !settings?.contentTypes || !taxonomy) {
      return unmapped;
    }

    for (const page of pages) {
      let values: string[] = [];

      if (taxonomy === 'tags') {
        values = page.fmTags || [];
      } else if (taxonomy === 'categories') {
        values = page.fmCategories || [];
      } else {
        const contentType = settings.contentTypes.find((ct) => ct.name === page.fmContentType);

        if (!contentType) {
          return false;
        }

        const fieldName = getTaxonomyField(taxonomy, contentType);

        if (fieldName && page[fieldName]) {
          values = page[fieldName];
        }
      }

      if (typeof values === 'string') {
        values = [values];
      }

      for (const value of values) {
        if (!items.includes(value)) {
          unmapped.push(value);
        }
      }
    }

    const unmappedItems = [...new Set(unmapped)].filter(i => i);

    if (debounceFilterValue) {
      return unmappedItems.filter((i) => i.toLowerCase().includes(debounceFilterValue.toLowerCase()));
    }

    return unmappedItems;
  }, [items, taxonomy, pages, settings?.contentTypes, debounceFilterValue]);

  React.useEffect(() => {
    if (prevTaxonomy !== taxonomy) {
      setFilterValue('');
    }
  }, [prevTaxonomy, taxonomy])

  if (!taxonomy) {
    return null;
  }

  return (
    <div className={`py-6 px-4 flex flex-col h-full overflow-hidden`}>
      <div className={`flex w-full justify-between flex-shrink-0`}>
        <div>
          <h2 className={`text-lg first-letter:uppercase text-[var(--frontmatter-text)]`}>
            {taxonomy}
          </h2>
          <p className={`mt-2 text-sm first-letter:uppercase text-[var(--frontmatter-secondary-text)]`}>
            {l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyManagerDescription, taxonomy)}
          </p>
        </div>
        <div className='flex gap-4 justify-center items-center'>
          <FilterInput
            placeholder={l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyManagerFilterInputPlaceholder, taxonomy)}
            value={filterValue}
            onChange={(value) => setFilterValue(value)}
            onReset={() => setFilterValue('')} />

          <div>
            <button
              className={`inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium focus:outline-none rounded text-[var(--vscode-button-foreground)] bg-[var(--frontmatter-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50`}
              title={l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyManagerButtonCreate, taxonomy)}
              onClick={onCreate}
            >
              <PlusIcon className={`mr-2 h-6 w-6`} />
              <span className={`text-sm`}>{l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyManagerButtonCreate, taxonomy)}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 pb-6 -mr-4 pr-4 flex flex-col flex-grow overflow-auto">
        <table className="min-w-full divide-y divide-[var(--frontmatter-border)]">
          <thead>
            <tr>
              <th
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium uppercase text-[var(--frontmatter-secondary-text)]`}
              >
                {l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyManagerTableHeadingName)}
              </th>
              <th
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium uppercase text-[var(--frontmatter-secondary-text)]`}
              >
                {l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyManagerTableHeadingCount)}
              </th>
              <th
                scope="col"
                className={`px-6 py-3 text-right text-xs font-medium uppercase text-[var(--frontmatter-secondary-text)]`}
              >
                {l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyManagerTableHeadingAction)}
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-[var(--frontmatter-border)]`}>
            {items && items.length > 0
              ? items.map((item, index) => (
                <tr key={index}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--frontmatter-text)]`}>
                    <TagIcon className="inline-block h-4 w-4 mr-2" />
                    <span>{item}</span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--frontmatter-text)]`}>
                    <TaxonomyLookup taxonomy={taxonomy} value={item} pages={pages} />
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium`}>
                    <TaxonomyActions field={taxonomy} value={item} onContentTagging={onContentTagging} />
                  </td>
                </tr>
              ))
              : !unmappedItems ||
              (unmappedItems.length === 0 && (
                <tr>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--frontmatter-text)]`}
                    colSpan={4}
                  >
                    {l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyManagerTableRowEmpty, taxonomy)}
                  </td>
                </tr>
              ))}

            {unmappedItems &&
              unmappedItems.length > 0 &&
              unmappedItems.map((item, index) => (
                <tr key={index}>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--frontmatter-text)]`}
                    title={l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyManagerTableUnmappedTitle)}
                  >
                    <ExclamationTriangleIcon className="inline-block h-4 w-4 mr-2" />
                    <span>{item}</span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--frontmatter-text)]`}>
                    <TaxonomyLookup taxonomy={taxonomy} value={item} pages={pages} />
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium`}>
                    <TaxonomyActions field={taxonomy} value={item} onContentTagging={onContentTagging} unmapped />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
