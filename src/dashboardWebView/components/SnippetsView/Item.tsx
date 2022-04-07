import { Messenger } from '@estruyf/vscode/dist/client';
import { CodeIcon, DotsHorizontalIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useCallback, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FeatureFlag } from '../../../components/features/FeatureFlag';
import { FEATURE_FLAG } from '../../../constants';
import { SnippetParser } from '../../../helpers/SnippetParser';
import { Snippet, Snippets } from '../../../models';
import { DashboardMessage } from '../../DashboardMessage';
import { ModeAtom, SettingsSelector, ViewDataSelector } from '../../state';
import { QuickAction } from '../Menu';
import { Alert } from '../Modals/Alert';
import { FormDialog } from '../Modals/FormDialog';
import { NewForm } from './NewForm';
import SnippetForm, { SnippetFormHandle } from './SnippetForm';

export interface IItemProps {
  title: string;
  snippet: Snippet;
}

export const Item: React.FunctionComponent<IItemProps> = ({ title, snippet }: React.PropsWithChildren<IItemProps>) => {
  const viewData = useRecoilValue(ViewDataSelector);
  const settings = useRecoilValue(SettingsSelector);
  const mode = useRecoilValue(ModeAtom);
  const [ showInsertDialog, setShowInsertDialog ] = useState(false);
  const [ showEditDialog, setShowEditDialog ] = useState(false);
  const [ showAlert, setShowAlert ] = React.useState(false);

  const [ snippetTitle, setSnippetTitle ] = useState<string>('');
  const [ snippetDescription, setSnippetDescription ] = useState<string>('');
  const [ snippetOriginalBody, setSnippetOriginalBody ] = useState<string>('');

  const formRef = useRef<SnippetFormHandle>(null);

  const insertToArticle = () => {
    formRef.current?.onSave();
    setShowInsertDialog(false);
  };

  const reset = () => {
    setShowEditDialog(false);
    setSnippetTitle('');
    setSnippetDescription('');
    setSnippetOriginalBody('');
  };

  const onOpenEdit = useCallback(() => {
    setSnippetTitle(title);
    setSnippetDescription(snippet.description);
    setSnippetOriginalBody(typeof snippet.body === "string" ? snippet.body : snippet.body.join(`\n`));
    setShowEditDialog(true);
  }, [snippet]);
  
  const onSnippetUpdate = useCallback(() => {
    if (!snippetTitle || !snippetOriginalBody) {
      reset();
      return;
    }

    const snippets: Snippets = Object.assign({}, settings?.snippets || {});
    const snippetLines = snippetOriginalBody.split("\n");

    const crntSnippet = Object.assign({}, snippets[title]);
    
    const fields = SnippetParser.getFields(snippetLines, crntSnippet.fields || [], crntSnippet?.openingTags, crntSnippet?.closingTags);

    const snippetContents: Snippet = {
      ...crntSnippet,
      fields,
      description: snippetDescription || '',
      body: snippetLines.length === 1 ? snippetLines[0] : snippetLines
    };

    // Check if new or update
    if (title === snippetTitle) {
      snippets[title] = snippetContents;
    } else {
      delete snippets[title];
      snippets[snippetTitle] = snippetContents;
    }

    Messenger.send(DashboardMessage.updateSnippet, { snippets });

    reset();
  }, [settings?.snippets, title, snippetTitle, snippetDescription, snippetOriginalBody]);

  const onDelete = useCallback(() => {
    const snippets = Object.assign({}, settings?.snippets || {});
    delete snippets[title];

    Messenger.send(DashboardMessage.updateSnippet, { snippets });

    setShowAlert(false);
  }, [settings?.snippets, title]);
  
  return (
    <>
      <li className="group relative overflow-hidden bg-gray-50 dark:bg-vulcan-200 shadow-md hover:shadow-xl dark:shadow-none dark:hover:bg-vulcan-100 border border-gray-200 dark:border-vulcan-50 p-4 space-y-2">
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
          <CodeIcon className='w-64 h-64 opacity-5 text-vulcan-200 dark:text-gray-400' />
        </div>

        <h2 className="mt-2 mb-2 font-bold">{title}</h2>

        <FeatureFlag 
          features={mode?.features || []} 
          flag={FEATURE_FLAG.dashboard.snippets.manage}
          alternative={(
            viewData?.data?.filePath ? (
              <div className={`absolute top-4 right-4 flex flex-col space-y-4`}>
                <div className="flex items-center border border-transparent group-hover:bg-gray-200 dark:group-hover:bg-vulcan-200 group-hover:border-gray-100 dark:group-hover:border-vulcan-50 rounded-full p-2 -mr-2 -mt-2">
                  <div className='group-hover:hidden'>
                    <DotsHorizontalIcon className="w-4 h-4" />
                  </div>

                  <div className='hidden group-hover:flex'>
                    <QuickAction 
                      title={`Insert snippet`}
                      onClick={() => setShowInsertDialog(true)}>
                      <PlusIcon className={`w-4 h-4`} aria-hidden="true" />
                    </QuickAction>
                  </div>
                </div>
              </div>
            ) : undefined
          )}
        >
          <div className={`absolute top-4 right-4 flex flex-col space-y-4`}>
            <div className="flex items-center border border-transparent group-hover:bg-gray-200 dark:group-hover:bg-vulcan-200 group-hover:border-gray-100 dark:group-hover:border-vulcan-50 rounded-full p-2 -mr-2 -mt-2">
              <div className='group-hover:hidden'>
                <DotsHorizontalIcon className="w-4 h-4" />
              </div>

              <div className='hidden group-hover:flex'>
                {
                  viewData?.data?.filePath && (
                    <>
                      <QuickAction 
                        title={`Insert snippet`}
                        onClick={() => setShowInsertDialog(true)}>
                        <PlusIcon className={`w-4 h-4`} aria-hidden="true" />
                      </QuickAction>
                    </>
                  )
                }

                <QuickAction 
                  title={`Edit snippet`}
                  onClick={onOpenEdit}>
                  <PencilIcon className={`w-4 h-4`} aria-hidden="true" />
                </QuickAction>

                <QuickAction 
                  title={`Delete snippet`}
                  onClick={() => setShowAlert(true)}>
                  <TrashIcon className={`w-4 h-4`} aria-hidden="true" />
                </QuickAction>
              </div>
            </div>
          </div>
        </FeatureFlag>

        <p className="text-xs text-vulcan-200 dark:text-whisper-800">{snippet.description}</p>
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
              ref={formRef}
              snippet={snippet}
              selection={viewData?.data?.selection} />

          </FormDialog>
        )
      }

      {
        showEditDialog && (
          <FormDialog 
            title={`Edit snippet: ${title}`}
            description={`Edit the ${title.toLowerCase()} snippet`}
            isSaveDisabled={!snippetTitle || !snippetOriginalBody}
            trigger={onSnippetUpdate}
            dismiss={reset}
            okBtnText='Update'
            cancelBtnText='Cancel'>

            <NewForm 
              title={snippetTitle}
              description={snippetDescription}
              body={snippetOriginalBody}
              onTitleUpdate={(value: string) => setSnippetTitle(value)}
              onDescriptionUpdate={(value: string) => setSnippetDescription(value)}
              onBodyUpdate={(value: string) => setSnippetOriginalBody(value)} />
            
          </FormDialog>
        )
      }

      {
        showAlert && (
          <Alert 
            title={`Delete snippet: ${title}`}
            description={`Are you sure you want to delete the ${title.toLowerCase()} snippet?`}
            okBtnText={`Delete`}
            cancelBtnText={`Cancel`}
            dismiss={() => setShowAlert(false)}
            trigger={onDelete} />
        )
      }
    </>
  );
};