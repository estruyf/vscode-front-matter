import * as React from 'react';
import { Page } from '../../models';
import { useRecoilValue } from 'recoil';
import { SettingsSelector } from '../../state';
import { getTaxonomyField } from '../../../helpers/getTaxonomyField';
import { Sorting } from '../../../helpers/Sorting';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '../Common/Button';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import { FilterInput } from './FilterInput';
import { useDebounce } from '../../../hooks/useDebounce';

export interface ITaxonomyTaggingProps {
  taxonomy: string | null;
  value: string;
  pages: Page[];
  onContentMapping: (value: string, pages: Page[]) => void;
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
  const [selectedPages, setSelectedPages] = React.useState<Page[]>([]);
  const [filterValue, setFilterValue] = React.useState('');
  const debounceFilterValue = useDebounce<string>(filterValue, 500);

  const onCheckboxClick = React.useCallback((page: Page) => {
    const pageIdx = selectedPages.findIndex((p: Page) => p.fmFilePath === page.fmFilePath);
    if (pageIdx === -1) {
      setSelectedPages([...selectedPages, page]);
    } else {
      const newSelectedPages = [...selectedPages];
      newSelectedPages.splice(pageIdx, 1);
      setSelectedPages(newSelectedPages);
    }
  }, [selectedPages]);

  const checkIfChecked = React.useCallback((page: Page) => {
    return selectedPages.find((p: Page) => p.fmFilePath === page.fmFilePath);
  }, [selectedPages]);

  const untaggedPages = React.useMemo(() => {
    let untagged: Page[] = [];

    if (!pages || !settings?.contentTypes || !taxonomy) {
      return untagged;
    }

    for (const page of pages) {
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
  }, [pages, taxonomy, value, debounceFilterValue]);

  console.log(`Selected pages`, selectedPages)

  return (
    <div className={`py-6 px-4 flex flex-col h-full overflow-hidden`}>
      <div className={`flex w-full justify-between flex-shrink-0`}>
        <div className={`flex gap-2 items-center`}>
          <button onClick={onDismiss} title='Back'>
            <span className='sr-only'>Back</span>
            <ArrowLeftIcon className='w-5 h-5 text-[var(--frontmatter-text)]' />
          </button>
          <h2 className={`text-lg first-letter:uppercase text-[var(--frontmatter-text)]`}>
            Map your content with: {value} <span className='ml-2'></span>
          </h2>
        </div>
        <div className='flex gap-4 justify-center items-center'>
          <FilterInput
            placeholder='Filter'
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
                Name
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-[var(--frontmatter-border)]`}>
            {untaggedPages.map((page) => (
              <tr key={page.fmFilePath} className='py-2'>
                <td className={`pl-6 w-[25px]`}>
                  <VSCodeCheckbox
                    onClick={() => onCheckboxClick(page)}
                    checked={checkIfChecked(page)}>
                    <span className='sr-only'>Tag page</span>
                  </VSCodeCheckbox>
                </td>
                <td className={`pr-6 whitespace-nowrap text-sm font-medium text-[var(--frontmatter-text)]`}>
                  <button
                    title={page.title}
                    onClick={() => onCheckboxClick(page)}>
                    {page.title}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='flex justify-end space-x-2'>
        <Button onClick={onDismiss} secondary>Cancel</Button>
        <Button onClick={() => onContentMapping(value, selectedPages)}>Apply</Button>
      </div>
    </div>
  );
};