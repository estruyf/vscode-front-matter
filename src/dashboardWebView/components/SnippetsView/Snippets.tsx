import { CodeIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { AddIcon } from '../../../panelWebView/components/Icons/AddIcon';
import { SettingsSelector, ViewDataSelector } from '../../state';
import { PageLayout } from '../Layout/PageLayout';
import { Item } from './Item';

export interface ISnippetsProps {}

export const Snippets: React.FunctionComponent<ISnippetsProps> = (props: React.PropsWithChildren<ISnippetsProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const viewData = useRecoilValue(ViewDataSelector);

  const snippets = settings?.snippets || [];
  
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
        snippets && snippets.length > 0 ? (
          <ul role="list" className={`grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8`}>
            {
              snippets.map((snippet: any, index: number) => (
                <Item snippet={snippet} key={index} />
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