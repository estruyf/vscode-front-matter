import { Messenger } from '@estruyf/vscode/dist/client';
import { ExclamationIcon, PlusSmIcon, TagIcon } from '@heroicons/react/outline';
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
import useThemeColors from '../../hooks/useThemeColors';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface ITaxonomyManagerProps {
  data: TaxonomyData | undefined;
  taxonomy: string | null;
  pages: Page[];
}

export const TaxonomyManager: React.FunctionComponent<ITaxonomyManagerProps> = ({
  data,
  taxonomy,
  pages
}: React.PropsWithChildren<ITaxonomyManagerProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const { getColors } = useThemeColors();

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

      return crntItems.filter(i => i);
    }

    return [];
  }, [data, taxonomy]);

  const unmappedItems = useMemo(() => {
    let unmapped: string[] = [];

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

        let fieldName = getTaxonomyField(taxonomy, contentType);

        if (fieldName && page[fieldName]) {
          values = page[fieldName];
        }
      }

      for (const value of values) {
        if (!items.includes(value)) {
          unmapped.push(value);
        }
      }
    }

    return [...new Set(unmapped)].filter(i => i);
  }, [items, taxonomy, pages, settings?.contentTypes]);

  if (!taxonomy) {
    return null;
  }

  return (
    <div className={`py-6 px-4 flex flex-col h-full overflow-hidden`}>
      <div className={`flex w-full justify-between flex-shrink-0`}>
        <div>
          <h2 className={`text-lg first-letter:uppercase ${getColors(
            'text-gray-500 dark:text-whisper-900',
            'text-[var(--frontmatter-text)]'
          )
            }`}>
            {taxonomy}
          </h2>
          <p className={`mt-2 text-sm first-letter:uppercase ${getColors(
            'text-gray-500 dark:text-whisper-900',
            'text-[var(--frontmatter-secondary-text)]'
          )
            }`}>
            {l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyManagerDescription, taxonomy)}
          </p>
        </div>
        <div>
          <button
            className={`inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium focus:outline-none rounded ${getColors(
              `text-white dark:text-vulcan-500 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500`,
              `text-[var(--vscode-button-foreground)] bg-[var(--frontmatter-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50`
            )
              }`}
            title={l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyManagerButtonCreate, taxonomy)}
            onClick={onCreate}
          >
            <PlusSmIcon className={`mr-2 h-6 w-6`} />
            <span className={`text-sm`}>{l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyManagerButtonCreate, taxonomy)}</span>
          </button>
        </div>
      </div>

      <div className="mt-6 pb-6 -mr-4 pr-4 flex flex-col flex-grow overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-vulcan-300">
          <thead>
            <tr>
              <th
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium uppercase ${getColors('text-gray-500 dark:text-whisper-900', 'text-[var(--frontmatter-secondary-text)]')}`}
              >
                {l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyManagerTableHeadingName)}
              </th>
              <th
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium uppercase ${getColors('text-gray-500 dark:text-whisper-900', 'text-[var(--frontmatter-secondary-text)]')}`}
              >
                {l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyManagerTableHeadingCount)}
              </th>
              <th
                scope="col"
                className={`px-6 py-3 text-right text-xs font-medium uppercase ${getColors('text-gray-500 dark:text-whisper-900', 'text-[var(--frontmatter-secondary-text)]')}`}
              >
                {l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyManagerTableHeadingAction)}
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${getColors(`divide-gray-200 dark:divide-vulcan-300`, `divide-[var(--frontmatter-border)]`)}`}>
            {items && items.length > 0
              ? items.map((item, index) => (
                <tr key={index}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getColors(`text-gray-800 dark:text-gray-200`, `text-[var(--frontmatter-text)]`)}`}>
                    <TagIcon className="inline-block h-4 w-4 mr-2" />
                    <span>{item}</span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getColors(`text-gray-800 dark:text-gray-200`, `text-[var(--frontmatter-text)]`)}`}>
                    <TaxonomyLookup taxonomy={taxonomy} value={item} pages={pages} />
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium`}>
                    <TaxonomyActions field={taxonomy} value={item} />
                  </td>
                </tr>
              ))
              : !unmappedItems ||
              (unmappedItems.length === 0 && (
                <tr>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getColors(`text-gray-800 dark:text-gray-200`, `text-[var(--frontmatter-text)]`)}`}
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
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getColors(`text-gray-800 dark:text-gray-200`, `text-[var(--frontmatter-text)]`)}`}
                    title={l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyManagerTableUnmappedTitle)}
                  >
                    <ExclamationIcon className="inline-block h-4 w-4 mr-2" />
                    <span>{item}</span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getColors(`text-gray-800 dark:text-gray-200`, `text-[var(--frontmatter-text)]`)}`}>
                    <TaxonomyLookup taxonomy={taxonomy} value={item} pages={pages} />
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium`}>
                    <TaxonomyActions field={taxonomy} value={item} unmapped />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
