import { Messenger } from '@estruyf/vscode/dist/client';
import { DotsHorizontalIcon, PlusIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Choice, Scanner, SnippetParser, TokenType, Variable, VariableResolver } from '../../../helpers/SnippetParser';
import { DashboardMessage } from '../../DashboardMessage';
import { ViewDataSelector } from '../../state';
import { FormDialog } from '../Modals/FormDialog';
import { SnippetForm } from './SnippetForm';

export interface IItemProps {
  title: string;
  snippet: any;
}

export const Item: React.FunctionComponent<IItemProps> = ({ title, snippet }: React.PropsWithChildren<IItemProps>) => {
  const viewData = useRecoilValue(ViewDataSelector);
  const [ showInsertDialog, setShowInsertDialog ] = useState(false);

  // Todo: On add, show dialog to insert the placeholders and content

  const insertToArticle = () => {
    Messenger.send(DashboardMessage.insertSnippet, {
      file: viewData?.data?.filePath,
      snippet: snippet.body.join(`\n`)
    });
  };
  
  return (
    <>
      <li className="group relative bg-gray-50 dark:bg-vulcan-200 shadow-md hover:shadow-xl dark:shadow-none dark:hover:bg-vulcan-100 border border-gray-100 dark:border-vulcan-50 p-4 space-y-2">
        <div className="font-bold text-xl">{title}</div>

        <div className={`absolute top-4 right-4 flex flex-col space-y-4`}>
          <div className="flex items-center border border-transparent group-hover:bg-gray-200 dark:group-hover:bg-vulcan-200 group-hover:border-gray-100 dark:group-hover:border-vulcan-50 rounded-full p-2 -mr-2 -mt-2">
            <div className='group-hover:hidden'>
              <DotsHorizontalIcon className="w-4 h-4" />
            </div>

            <div className='hidden group-hover:flex space-x-2'>
              {
                viewData?.data?.filePath ? (
                  <>
                    <button onClick={() => setShowInsertDialog(true)}>
                      <PlusIcon className='w-4 h-4' />
                      <span className='sr-only'>Insert snippet</span>
                    </button>
                  </>
                ) : (
                  <div>Edit</div>
                )
              }
            </div>
          </div>
        </div>

        <p className="text-whisper-900 text-base">{snippet.description}</p>
      </li>

      {
        showInsertDialog && (
          <FormDialog 
            title={`Insert snippet: ${title}`}
            description={`Insert the ${title.toLowerCase()} snippet into the current article`}
            isSaveDisabled={!viewData?.data?.filePath}
            trigger={insertToArticle}
            dismiss={() => setShowInsertDialog(false)}
            okBtnText='Insert'
            cancelBtnText='Cancel'>
          
            <SnippetForm
              snippet={snippet} />

          </FormDialog>
        )
      }
    </>
  );
};