import * as React from 'react';
import { Page, PageMappings, SortingOption } from '../../models';
import { useRecoilValue } from 'recoil';
import { SettingsSelector } from '../../state';
import { getTaxonomyField } from '../../../helpers/getTaxonomyField';
import { Sorting } from '../../../helpers/Sorting';
import { ArrowLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '../Common/Button';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import { FilterInput } from './FilterInput';
import { useDebounce } from '../../../hooks/useDebounce';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { sortPages } from '../../../utils/sortPages';
import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { ExtensionState } from '../../../constants';
import { LinkButton } from '../Common/LinkButton';

export interface ITaxonomyTaggingProps {
  taxonomy: string | null;
  value: string;
  pages: Page[];
  onContentMapping: (value: string, pageMappings: PageMappings) => void;
  onDismiss: () => void;
}

export const TaxonomyTagging: React.FunctionComponent<ITaxonomyTaggingProps> = ({
  taxonomy,
  value,
  pages,
  onContentMapping,
  onDismiss,
}: React.PropsWithChildren<ITaxonomyTaggingProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const [sortedPages, setSortedPages] = React.useState<Page[]>([]);
  const [pageMappings, setPageMappings] = React.useState<{
    tagged: Page[];
    untagged: Page[];
  }>({
    tagged: [],
    untagged: []
  });
  const [filterValue, setFilterValue] = React.useState('');
  const debounceFilterValue = useDebounce<string>(filterValue, 500);

  const untaggedPages = React.useMemo(() => {
    let untagged: Page[] = [];

    if (!sortedPages || !settings?.contentTypes || !taxonomy) {
      return untagged;
    }

    for (const page of sortedPages) {
      if (taxonomy === 'tags') {
        if (!page.fmTags || page.fmTags.indexOf(value) === -1) {
          untagged.push(page);
        }
        continue;
      } else if (taxonomy === 'categories') {
        if (!page.fmCategories || page.fmCategories.indexOf(value) === -1) {
          untagged.push(page);
        }
        continue;
      } else {
        const contentType = settings.contentTypes.find((ct) => ct.name === page.fmContentType);

        if (!contentType) {
          continue;
        }

        let fieldName = getTaxonomyField(taxonomy, contentType);

        if (fieldName && (!page[fieldName] || page[fieldName].indexOf(value) === -1)) {
          untagged.push(page);
        }
      }
    }

    untagged = untagged.sort(Sorting.number('fmPublished')).reverse();

    if (debounceFilterValue) {
      return untagged.filter((p) => p.title.toLowerCase().includes(debounceFilterValue.toLowerCase()));
    }

    return untagged;
  }, [sortedPages, taxonomy, value, debounceFilterValue]);

  const onCheckboxClick = React.useCallback((page: Page) => {
    const untaggedPage = untaggedPages.find((p: Page) => p.fmFilePath === page.fmFilePath);

    const clonedPageMappings = Object.assign({}, pageMappings);
    const taggedIdx = pageMappings.tagged.findIndex((p: Page) => p.fmFilePath === page.fmFilePath);
    const untaggedIdx = pageMappings.untagged.findIndex((p: Page) => p.fmFilePath === page.fmFilePath);

    if (untaggedPage) {
      // Page was not yet tagged
      if (taggedIdx === -1) {
        clonedPageMappings.tagged.push(page);

        if (untaggedIdx !== -1) {
          clonedPageMappings.untagged.splice(untaggedIdx, 1);
        }
      } else {
        clonedPageMappings.tagged.splice(taggedIdx, 1);

        if (untaggedIdx === -1) {
          clonedPageMappings.untagged.push(page);
        }
      }
    } else {
      // Page was already tagged, so only the untagged array needs to be updated
      if (untaggedIdx === -1) {
        clonedPageMappings.untagged.push(page);
      } else {
        clonedPageMappings.untagged.splice(taggedIdx, 1);
      }
    }

    setPageMappings(clonedPageMappings);
  }, [pageMappings, untaggedPages]);

  const checkIfChecked = React.useCallback((page: Page) => {
    return (!untaggedPages.find((p: Page) => p.fmFilePath === page.fmFilePath) && !pageMappings.untagged.find((p: Page) => p.fmFilePath === page.fmFilePath)) || pageMappings.tagged.find((p: Page) => p.fmFilePath === page.fmFilePath);
  }, [untaggedPages, pageMappings.tagged]);

  const onFileView = (filePath: string) => {
    Messenger.send(DashboardMessage.openFile, filePath);
  }

  React.useEffect(() => {
    messageHandler.request<{ key: string; value: SortingOption; }>(DashboardMessage.getState, {
      key: ExtensionState.Dashboard.Contents.Sorting
    }).then(({ key, value }) => {
      if (key === ExtensionState.Dashboard.Contents.Sorting && value) {
        const sorted = sortPages(pages, value)
        setSortedPages(sorted);
      } else {
        setSortedPages(pages);
      }
    });
  }, [pages]);

  return (
    <div className={`py-6 px-4 flex flex-col h-full overflow-hidden`}>
      <div className={`flex w-full justify-between flex-shrink-0`}>
        <div className={`flex gap-2 items-center`}>
          <button onClick={onDismiss} title={l10n.t(LocalizationKey.commonBack)}>
            <span className='sr-only'>{l10n.t(LocalizationKey.commonBack)}</span>
            <ArrowLeftIcon className='w-5 h-5 text-[var(--frontmatter-text)]' />
          </button>
          <h2 className={`text-lg first-letter:uppercase text-[var(--frontmatter-text)]`}>
            {l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyTaggingPageTitle, value)}
          </h2>
        </div>
        <div className='flex gap-4 justify-center items-center'>
          <FilterInput
            placeholder={l10n.t(LocalizationKey.commonFilter)}
            value={filterValue}
            onChange={(value) => setFilterValue(value)}
            onReset={() => setFilterValue('')} />
        </div>
      </div>

      <div className='mt-6 mb-2 -mr-4 pr-4 flex flex-col flex-grow overflow-auto'>
        <table className="min-w-full divide-y divide-[var(--frontmatter-border)]">
          <thead>
            <tr>
              <th
                scope="col"
                className={``}
              >

              </th>
              <th
                scope="col"
                className={`pr-6 py-3 text-left text-xs font-medium uppercase text-[var(--frontmatter-secondary-text)]`}
              >
                {l10n.t(LocalizationKey.commonTitle)}
              </th>
              <th
                scope="col"
                className={``}
              >

              </th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-[var(--frontmatter-border)]`}>
            {untaggedPages && sortedPages && sortedPages.map((page) => (
              <tr key={page.fmFilePath}>
                <td className={`pl-6 py-2 w-[25px]`}>
                  <VSCodeCheckbox
                    title={l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyTaggingCheckbox, value)}
                    onClick={() => onCheckboxClick(page)}
                    checked={checkIfChecked(page)}>
                    <span className='sr-only'>
                      {l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyTaggingCheckbox, value)}
                    </span>
                  </VSCodeCheckbox>
                </td>
                <td className={`py-2 text-sm font-medium text-[var(--frontmatter-text)]`}>
                  <button
                    title={l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyTaggingCheckbox, value)}
                    className='hover:text-[var(--vscode-textLink-activeForeground)] text-left'
                    onClick={() => onCheckboxClick(page)}>
                    {page.title}
                  </button>
                </td>
                <td className={`py-2 pr-6`}>
                  <LinkButton
                    title={l10n.t(LocalizationKey.dashboardContentsContentActionsMenuItemView)}
                    onClick={() => onFileView(page.fmFilePath)}>
                    <EyeIcon className={`w-4 h-4`} aria-hidden={true} />
                    <span className='sr-only'>
                      {l10n.t(LocalizationKey.dashboardContentsContentActionsMenuItemView)}
                    </span>
                  </LinkButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='flex justify-end space-x-2'>
        <Button onClick={onDismiss} secondary>{l10n.t(LocalizationKey.commonCancel)}</Button>
        <Button onClick={() => onContentMapping(value, pageMappings)}>{l10n.t(LocalizationKey.commonApply)}</Button>
      </div>
    </div>
  );
};