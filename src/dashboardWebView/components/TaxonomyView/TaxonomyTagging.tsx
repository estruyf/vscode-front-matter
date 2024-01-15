import * as React from 'react';
import { Page } from '../../models';
import { useRecoilValue } from 'recoil';
import { SettingsSelector } from '../../state';
import { getTaxonomyField } from '../../../helpers/getTaxonomyField';
import { Sorting } from '../../../helpers/Sorting';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export interface ITaxonomyTaggingProps {
  taxonomy: string | null;
  value: string;
  pages: Page[];
  onDismiss: () => void;
}

export const TaxonomyTagging: React.FunctionComponent<ITaxonomyTaggingProps> = ({
  taxonomy,
  value,
  pages,
  onDismiss
}: React.PropsWithChildren<ITaxonomyTaggingProps>) => {
  const settings = useRecoilValue(SettingsSelector);

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

    return untagged;
  }, [pages, taxonomy, value]);

  return (
    <div className={`py-6 px-4 flex flex-col h-full overflow-hidden`}>
      <div className={`flex w-full justify-between flex-shrink-0`}>
        <h2 className='text-lg first-letter:uppercase flex items-center'>

          <button onClick={onDismiss} title='Back' className='mr-2'>
            <span className='sr-only'>Back</span>
            <ArrowLeftIcon className='w-5 h-5 text-[var(--frontmatter-text)]' />
          </button>

          {taxonomy}: {value}
        </h2>
      </div>

      <div className='mt-6 -mr-4 pr-4 flex flex-col flex-grow overflow-auto'>
        <ul>
          {untaggedPages.map((page) => (
            <li key={page.fmFilePath}>
              <input type='checkbox' />
              <span>{page.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};