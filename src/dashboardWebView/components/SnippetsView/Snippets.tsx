import { Messenger } from '@estruyf/vscode/dist/client';
import { CodeIcon, PlusSmIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { DashboardMessage } from '../../DashboardMessage';
import { SettingsSelector, ViewDataSelector } from '../../state';
import { PageLayout } from '../Layout/PageLayout';
import { FormDialog } from '../Modals/FormDialog';
import { Item } from './Item';
import { NewForm } from './NewForm';

export interface ISnippetsProps {}

export const Snippets: React.FunctionComponent<ISnippetsProps> = (props: React.PropsWithChildren<ISnippetsProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const viewData = useRecoilValue(ViewDataSelector);
  const [ snippetTitle, setSnippetTitle ] = useState<string>('');
  const [ snippetDescription, setSnippetDescription ] = useState<string>('');
  const [ snippetBody, setSnippetBody ] = useState<string>('');
  const [ showCreateDialog, setShowCreateDialog ] = useState(false);

  const snippetKeys = useMemo(() => Object.keys(settings?.snippets) || [], [settings?.snippets]);
  const snippets = settings?.snippets || {};

  const onSnippetAdd = useCallback(() => {
    if (!snippetTitle || !snippetBody) {
      reset();
      return;
    }

    Messenger.send(DashboardMessage.addSnippet, {
      title: snippetTitle,
      description: snippetDescription || '',
      body: snippetBody
    });

    reset();
  }, [snippetTitle, snippetDescription, snippetBody]);

  const reset = () => {
    setShowCreateDialog(false);
    setSnippetTitle('');
    setSnippetDescription('');
    setSnippetBody('');
  };
  
  return (
    <PageLayout
      header={(
        <div
          className="py-3 px-4 flex items-center justify-between border-b border-gray-300 dark:border-vulcan-100"
          aria-label="Pagination"
        >
          <div className="flex flex-1 justify-end">
            <button 
              className={`inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium text-white dark:text-vulcan-500 bg-teal-600 hover:bg-teal-700 focus:outline-none disabled:bg-gray-500`}
              title={`Create new snippet`}
              onClick={() => setShowCreateDialog(true)}>
              <PlusSmIcon className={`mr-2 h-6 w-6`} />
              <span className={`text-sm`}>Create new snippet</span>
            </button>
          </div>
        </div>
      )}>      

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

      {
        showCreateDialog && (
          <FormDialog 
            title={`Create a snippet`}
            description={``}
            isSaveDisabled={!snippetTitle || !snippetBody}
            trigger={onSnippetAdd}
            dismiss={reset}
            okBtnText='Save'
            cancelBtnText='Cancel'>

            <NewForm 
              title={snippetTitle}
              description={snippetDescription}
              body={snippetBody}
              onTitleUpdate={(value: string) => setSnippetTitle(value)}
              onDescriptionUpdate={(value: string) => setSnippetDescription(value)}
              onBodyUpdate={(value: string) => setSnippetBody(value)} />
            
          </FormDialog>
        )
      }
    </PageLayout>
  );
};