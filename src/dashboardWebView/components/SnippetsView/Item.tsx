import * as l10n from '@vscode/l10n';
import { Messenger } from '@estruyf/vscode/dist/client';
import {
  CodeBracketIcon,
} from '@heroicons/react/24/solid';
import * as React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FeatureFlag } from '../../../components/features/FeatureFlag';
import { FEATURE_FLAG } from '../../../constants';
import { SnippetParser } from '../../../helpers/SnippetParser';
import { Snippet, Snippets } from '../../../models';
import { DashboardMessage } from '../../DashboardMessage';
import { ModeAtom, SettingsSelector, ViewDataSelector } from '../../state';
import { Alert } from '../Modals/Alert';
import { NewForm } from './NewForm';
import SnippetForm, { SnippetFormHandle } from './SnippetForm';
import { LocalizationKey } from '../../../localization';
import { FooterActions } from './FooterActions';
import { ItemMenu } from './ItemMenu';
import { SlideOver } from '../Modals/SlideOver';
import { DEFAULT_DASHBOARD_FEATURE_FLAGS } from '../../../constants/DefaultFeatureFlags';

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

    const snippets: Snippets = Object.assign({}, settings?.snippets || {});
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
      <li className={`group flex flex-col relative overflow-hidden shadow-md hover:shadow-xl dark:shadow-none border space-y-2 rounded bg-[var(--vscode-sideBar-background)] hover:bg-[var(--vscode-list-hoverBackground)] border-[var(--frontmatter-border)]`}>
        <div className='p-4 grow space-y-2'>
          <h2
            className="font-bold flex items-center"
            title={snippet.isMediaSnippet ? 'Media snippet' : 'Content snippet'}
          >
            <CodeBracketIcon className="w-5 h-5 mr-2" aria-hidden={true} />

            {snippet.title || snippetKey}
          </h2>

          <FeatureFlag
            features={mode?.features || DEFAULT_DASHBOARD_FEATURE_FLAGS}
            flag={FEATURE_FLAG.dashboard.snippets.manage}
            alternative={
              <ItemMenu
                insertEnabled={!!(insertToContent && !snippet.isMediaSnippet)}
                sourcePath={snippet.sourcePath}
                onInsert={() => setShowInsertDialog(true)} />
            }
          >
            <ItemMenu
              insertEnabled={!!(insertToContent && !snippet.isMediaSnippet)}
              sourcePath={snippet.sourcePath}
              onEdit={onOpenEdit}
              onInsert={() => setShowInsertDialog(true)}
              onDelete={() => setShowAlert(true)} />
          </FeatureFlag>

          <div className='inline-block mr-1 mt-1 text-xs text-[var(--vscode-button-secondaryForeground)] bg-[var(--vscode-button-secondaryBackground)] border border-[var(--frontmatter-border)] rounded px-1 py-0.5'>
            {
              snippet.isMediaSnippet ? l10n.t(LocalizationKey.dashboardSnippetsViewItemTypeContent) : l10n.t(LocalizationKey.dashboardSnippetsViewItemTypeMedia)
            }
          </div>

          <p className={`text-xs text-[var(--frontmatter-text)]`}>{snippet.description}</p>
        </div>

        <FeatureFlag
          features={mode?.features || DEFAULT_DASHBOARD_FEATURE_FLAGS}
          flag={FEATURE_FLAG.dashboard.snippets.manage}
          alternative={
            <FooterActions
              insertEnabled={!!(insertToContent && !snippet.isMediaSnippet)}
              sourcePath={snippet.sourcePath}
              onInsert={() => setShowInsertDialog(true)} />
          }
        >
          <FooterActions
            insertEnabled={!!(insertToContent && !snippet.isMediaSnippet)}
            sourcePath={snippet.sourcePath}
            onEdit={onOpenEdit}
            onInsert={() => setShowInsertDialog(true)}
            onDelete={() => setShowAlert(true)} />
        </FeatureFlag>
      </li>

      {showInsertDialog && (
        <SlideOver
          title={l10n.t(LocalizationKey.dashboardSnippetsViewItemInsertFormDialogTitle, snippet.title || snippetKey)}
          description={snippet.description || l10n.t(LocalizationKey.dashboardSnippetsViewItemInsertFormDialogDescription, (snippet.title || snippetKey).toLowerCase())}
          isSaveDisabled={!insertToContent}
          trigger={insertToArticle}
          dismiss={() => setShowInsertDialog(false)}
          okBtnText={l10n.t(LocalizationKey.commonInsert)}
          cancelBtnText={l10n.t(LocalizationKey.commonCancel)}
        >
          <SnippetForm
            ref={formRef}
            snippetKey={snippetKey}
            snippet={snippet}
            filePath={viewData?.data?.filePath}
            fieldInfo={viewData?.data?.snippetInfo?.fields}
            selection={viewData?.data?.selection} />
        </SlideOver>
      )}

      {showEditDialog && (
        <SlideOver
          title={l10n.t(LocalizationKey.dashboardSnippetsViewItemEditFormDialogTitle, snippet.title || snippetKey)}
          description={l10n.t(LocalizationKey.dashboardSnippetsViewItemEditFormDialogDescription, (snippet.title || snippetKey).toLowerCase())}
          isSaveDisabled={!snippetTitle || !snippetOriginalBody}
          trigger={onSnippetUpdate}
          dismiss={reset}
          okBtnText={l10n.t(LocalizationKey.commonUpdate)}
          cancelBtnText={l10n.t(LocalizationKey.commonCancel)}
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
        </SlideOver>
      )}

      {showAlert && (
        <Alert
          title={l10n.t(LocalizationKey.dashboardSnippetsViewItemAlertTitle, snippet.title || snippetKey)}
          description={l10n.t(LocalizationKey.dashboardSnippetsViewItemAlertDescription, (snippet.title || snippetKey).toLowerCase())}
          okBtnText={l10n.t(LocalizationKey.commonDelete)}
          cancelBtnText={l10n.t(LocalizationKey.commonCancel)}
          dismiss={() => setShowAlert(false)}
          trigger={onDelete}
        />
      )}
    </>
  );
};
