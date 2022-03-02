import { CodeIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { SettingsSelector, ViewDataSelector } from '../../state';
import { PageLayout } from '../Layout/PageLayout';
import { Item } from './Item';

export interface ISnippetsProps {}

export const Snippets: React.FunctionComponent<ISnippetsProps> = (props: React.PropsWithChildren<ISnippetsProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const viewData = useRecoilValue(ViewDataSelector);

  const snippetKeys = useMemo(() => Object.keys(settings?.snippets) || [], [settings?.snippets]);
  const snippets = settings?.snippets || {};
  
  return (
    <PageLayout>
      {
        viewData?.data?.filePath && (
          <div className={`text-xl text-center mb-6`}>
            <p>Select the snippet to add to your content.</p>
          </div>
        )
      }

      {
        snippetKeys && snippetKeys.length > 0 ? (
          <ul role="list" className={`grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8`}>
            {
              snippetKeys.map((snippetKey: any, index: number) => (
                <Item 
                  key={index}
                  title={snippetKey}
                  snippet={snippets[snippetKey]} />
              ))
            }
          </ul>
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <div className='flex flex-col items-center'>
              <CodeIcon className='w-32 h-32' />
              <p className='text-3xl'>No snippets found</p>
            </div>
          </div>
        )
      }
    </PageLayout>
  );
};