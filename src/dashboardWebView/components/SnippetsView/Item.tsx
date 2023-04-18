import { Messenger } from '@estruyf/vscode/dist/client';
import {
  CodeIcon,
  DocumentTextIcon,
  DotsHorizontalIcon,
  EyeIcon,
  PencilIcon,
  PhotographIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/outline';
import * as React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FeatureFlag } from '../../../components/features/FeatureFlag';
import { FEATURE_FLAG } from '../../../constants';
import { SnippetParser } from '../../../helpers/SnippetParser';
import { Snippet, Snippets } from '../../../models';
import { DashboardMessage } from '../../DashboardMessage';
import useThemeColors from '../../hooks/useThemeColors';
import { ModeAtom, SettingsSelector, ViewDataSelector } from '../../state';
import { QuickAction } from '../Menu';
import { Alert } from '../Modals/Alert';
import { FormDialog } from '../Modals/FormDialog';
import { NewForm } from './NewForm';
import SnippetForm, { SnippetFormHandle } from './SnippetForm';

export interface IItemProps {
  snippetKey: string;
  snippet: Snippet;
}

export const Item: React.FunctionComponent<IItemProps> = ({
  snippetKey,
  snippet,
}: React.PropsWithChildren<IItemProps>) => {
  const viewData = useRecoilValue(ViewDataSelector);
  const settings = useRecoilValue(SettingsSelector);
  const mode = useRecoilValue(ModeAtom);
  const [showInsertDialog, setShowInsertDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAlert, setShowAlert] = React.useState(false);
  const { getColors } = useThemeColors();

  const [snippetTitle, setSnippetTitle] = useState<string>('');
  const [snippetDescription, setSnippetDescription] = useState<string>('');
  const [snippetOriginalBody, setSnippetOriginalBody] = useState<string>('');
  const [mediaSnippet, setMediaSnippet] = useState<boolean>(false);

  const formRef = useRef<SnippetFormHandle>(null);

  const insertToContent = useMemo(() => viewData?.data?.filePath, [viewData]);

  const insertToArticle = () => {
    formRef.current?.onSave();
    setShowInsertDialog(false);
  };

  const reset = () => {
    setShowEditDialog(false);
    setSnippetTitle('');
    setSnippetDescription('');
    setSnippetOriginalBody('');
    setMediaSnippet(false);
  };

  const showFile = useCallback(() => {
    Messenger.send(DashboardMessage.openFile, snippet.sourcePath);
  }, [snippet]);

  const onOpenEdit = useCallback(() => {
    setSnippetTitle(snippet.title || snippetKey);
    setSnippetDescription(snippet.description);
    setSnippetOriginalBody(
      typeof snippet.body === 'string' ? snippet.body : snippet.body.join(`\n`)
    );
    setShowEditDialog(true);
    setMediaSnippet(!!snippet.isMediaSnippet);
  }, [snippet, snippetKey]);

  const onSnippetUpdate = useCallback(() => {
    if (!snippetTitle || !snippetOriginalBody) {
      reset();
      return;
    }

    let snippets: Snippets = Object.assign({}, settings?.snippets || {});
    const snippetLines = snippetOriginalBody.split('\n');

    const crntSnippet = Object.assign({}, snippets[snippetKey]);

    const fields = SnippetParser.getFields(
      snippetLines,
      crntSnippet.fields || [],
      crntSnippet?.openingTags,
      crntSnippet?.closingTags
    );

    const snippetContents: Snippet = {
      ...crntSnippet,
      description: snippetDescription || '',
      body: snippetLines.length === 1 ? snippetLines[0] : snippetLines
    };

    if (!mediaSnippet) {
      snippetContents.fields = fields;
    } else {
      snippetContents.isMediaSnippet = true;
    }

    // Check if there is a title set in the snippet
    if (snippet.title) {
      snippetContents.title = snippetTitle;
      snippets[snippetKey] = snippetContents;
    } else {
      // Check if new or update
      if (snippetKey === snippetTitle) {
        snippets[snippetKey] = snippetContents;
      } else {
        delete snippets[snippetKey];
        snippets[snippetTitle] = snippetContents;
      }
    }

    Messenger.send(DashboardMessage.updateSnippet, { snippets });

    reset();
  }, [
    settings?.snippets,
    snippetKey,
    snippetTitle,
    snippetDescription,
    snippetOriginalBody,
    mediaSnippet
  ]);

  const onDelete = useCallback(() => {
    const snippets = Object.assign({}, settings?.snippets || {});
    delete snippets[snippetKey];

    Messenger.send(DashboardMessage.updateSnippet, { snippets });

    setShowAlert(false);
  }, [settings?.snippets, snippetKey]);

  React.useEffect(() => {
    if (viewData?.data?.snippetInfo?.id && snippetKey && viewData.data.snippetInfo.id === snippetKey) {
      if (snippet) {
        setSnippetTitle(snippet.title || viewData?.data?.snippetInfo?.id);
        setSnippetDescription(snippet.description);
        setSnippetOriginalBody(
          typeof snippet.body === 'string'
            ? snippet.body
            : snippet.body.join(`\n`)
        );
        setMediaSnippet(!!snippet.isMediaSnippet);
        setShowInsertDialog(true);
      }
    }
  }, [viewData?.data?.snippetInfo?.id, snippetKey, snippet]);

  return (
    <>
      <li className={`group relative overflow-hidden shadow-md hover:shadow-xl dark:shadow-none border p-4 space-y-2 rounded ${getColors(
        'bg-gray-50 dark:bg-vulcan-200 dark:hover:bg-vulcan-100 border-gray-200 dark:border-vulcan-50',
        'bg-[var(--vscode-sideBar-background)] hover:bg-[var(--vscode-list-hoverBackground)] border-[var(--frontmatter-border)]'
      )
        }`}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <CodeIcon className={`w-64 h-64 opacity-5 ${getColors(
            'text-vulcan-200 dark:text-gray-400',
            'text-[var(--vscode-foreground)]'
          )
            }`} />
        </div>

        <h2
          className="mt-2 mb-2 font-bold flex items-center"
          title={snippet.isMediaSnippet ? 'Media snippet' : 'Content snippet'}
        >
          {snippet.isMediaSnippet ? (
            <PhotographIcon className="w-5 h-5 mr-1" aria-hidden={true} />
          ) : (
            <DocumentTextIcon className="w-5 h-5 mr-1" aria-hidden={true} />
          )}

          {snippet.title || snippetKey}
        </h2>

        <FeatureFlag
          features={mode?.features || []}
          flag={FEATURE_FLAG.dashboard.snippets.manage}
          alternative={
            insertToContent ? (
              <div className={`absolute top-4 right-4 flex flex-col space-y-4`}>
                <div className={`flex items-center border border-transparent rounded-full p-2 -mr-2 -mt-2 ${getColors(
                  'group-hover:bg-gray-200 dark:group-hover:bg-vulcan-200 group-hover:border-gray-100 dark:group-hover:border-vulcan-50',
                  'group-hover:bg-[var(--vscode-sideBar-background)] group-hover:border-[var(--frontmatter-border)]'
                )
                  }`}>
                  <div className="group-hover:hidden">
                    <DotsHorizontalIcon className="w-4 h-4" />
                  </div>

                  <div className="hidden group-hover:flex">
                    <QuickAction title={`Insert snippet`} onClick={() => setShowInsertDialog(true)}>
                      <PlusIcon className={`w-4 h-4`} aria-hidden="true" />
                    </QuickAction>
                  </div>
                </div>
              </div>
            ) : undefined
          }
        >
          <div className={`absolute top-4 right-4 flex flex-col space-y-4`}>
            <div className={`flex items-center border border-transparent rounded-full p-2 -mr-2 -mt-2 ${getColors(
              'group-hover:bg-gray-200 dark:group-hover:bg-vulcan-200 group-hover:border-gray-100 dark:group-hover:border-vulcan-50',
              'group-hover:bg-[var(--vscode-sideBar-background)] group-hover:border-[var(--frontmatter-border)]'
            )
              }`}>
              <div className="group-hover:hidden">
                <DotsHorizontalIcon className="w-4 h-4" />
              </div>

              <div className="hidden group-hover:flex">
                {insertToContent && !snippet.isMediaSnippet && (
                  <>
                    <QuickAction title={`Insert snippet`} onClick={() => setShowInsertDialog(true)}>
                      <PlusIcon className={`w-4 h-4`} aria-hidden="true" />
                    </QuickAction>
                  </>
                )}

                {!snippet.sourcePath ? (
                  <>
                    <QuickAction title={`Edit snippet`} onClick={onOpenEdit}>
                      <PencilIcon className={`w-4 h-4`} aria-hidden="true" />
                    </QuickAction>

                    <QuickAction title={`Delete snippet`} onClick={() => setShowAlert(true)}>
                      <TrashIcon className={`w-4 h-4`} aria-hidden="true" />
                    </QuickAction>
                  </>
                ) : (
                  <QuickAction title={`View snippet file`} onClick={showFile}>
                    <EyeIcon className={`w-4 h-4`} aria-hidden="true" />
                  </QuickAction>
                )}
              </div>
            </div>
          </div>
        </FeatureFlag>

        <p className={`text-xs ${getColors(
          'text-vulcan-200 dark:text-whisper-800',
          'text-[var(--vscode-foreground)]'
        )
          }`}>{snippet.description}</p>
      </li>

      {showInsertDialog && (
        <FormDialog
          title={`Insert snippet: ${snippet.title || snippetKey}`}
          description={`Insert the ${(
            snippet.title || snippetKey
          ).toLowerCase()} snippet into the current article`}
          isSaveDisabled={!insertToContent}
          trigger={insertToArticle}
          dismiss={() => setShowInsertDialog(false)}
          okBtnText="Insert"
          cancelBtnText="Cancel"
        >
          <SnippetForm
            ref={formRef}
            snippetKey={snippetKey}
            snippet={snippet}
            fieldInfo={viewData?.data?.snippetInfo?.fields}
            selection={viewData?.data?.selection} />
        </FormDialog>
      )}

      {showEditDialog && (
        <FormDialog
          title={`Edit snippet: ${snippet.title || snippetKey}`}
          description={`Edit the ${(snippet.title || snippetKey).toLowerCase()} snippet`}
          isSaveDisabled={!snippetTitle || !snippetOriginalBody}
          trigger={onSnippetUpdate}
          dismiss={reset}
          okBtnText="Update"
          cancelBtnText="Cancel"
        >
          <NewForm
            title={snippetTitle}
            description={snippetDescription}
            body={snippetOriginalBody}
            isMediaSnippet={mediaSnippet}
            onMediaSnippetUpdate={(value: boolean) => setMediaSnippet(value)}
            onTitleUpdate={(value: string) => setSnippetTitle(value)}
            onDescriptionUpdate={(value: string) => setSnippetDescription(value)}
            onBodyUpdate={(value: string) => setSnippetOriginalBody(value)}
          />
        </FormDialog>
      )}

      {showAlert && (
        <Alert
          title={`Delete snippet: ${snippet.title || snippetKey}`}
          description={`Are you sure you want to delete the ${(
            snippet.title || snippetKey
          ).toLowerCase()} snippet?`}
          okBtnText={`Delete`}
          cancelBtnText={`Cancel`}
          dismiss={() => setShowAlert(false)}
          trigger={onDelete}
        />
      )}
    </>
  );
};
