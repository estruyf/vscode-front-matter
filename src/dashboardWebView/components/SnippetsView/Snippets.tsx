import { Messenger } from '@estruyf/vscode/dist/client';
import { CodeIcon, PlusSmIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FeatureFlag } from '../../../components/features/FeatureFlag';
import { FEATURE_FLAG } from '../../../constants';
import { TelemetryEvent } from '../../../constants/TelemetryEvent';
import { SnippetParser } from '../../../helpers/SnippetParser';
import { DashboardMessage } from '../../DashboardMessage';
import useThemeColors from '../../hooks/useThemeColors';
import { ModeAtom, SettingsSelector, ViewDataSelector } from '../../state';
import { FilterInput } from '../Header/FilterInput';
import { PageLayout } from '../Layout/PageLayout';
import { FormDialog } from '../Modals/FormDialog';
import { SponsorMsg } from '../Layout/SponsorMsg';
import { Item } from './Item';
import { NewForm } from './NewForm';

export interface ISnippetsProps { }

export const Snippets: React.FunctionComponent<ISnippetsProps> = (
  props: React.PropsWithChildren<ISnippetsProps>
) => {
  const settings = useRecoilValue(SettingsSelector);
  const viewData = useRecoilValue(ViewDataSelector);
  const mode = useRecoilValue(ModeAtom);
  const [snippetTitle, setSnippetTitle] = useState<string>('');
  const [snippetDescription, setSnippetDescription] = useState<string>('');
  const [snippetBody, setSnippetBody] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [mediaSnippet, setMediaSnippet] = useState(false);
  const [snippetFilter, setSnippetFilter] = useState<string>('');
  const { getColors } = useThemeColors();

  const snippets = settings?.snippets || {};
  const snippetKeys = useMemo(() => {
    const allSnippetKeys = Object.keys(snippets).sort((a, b) => a.localeCompare(b));
    return allSnippetKeys.filter((key) => {
      const value = snippetFilter.toLowerCase();
      const keyValue = key.toLowerCase();
      const descriptionValue = snippets[key].description?.toLowerCase() || '';

      // Contains in key or description, values included in key are ranked higher (sort and fuzzy search)
      return keyValue.includes(value) || descriptionValue.includes(value);
    });
  }, [settings?.snippets, snippetFilter]);

  const onSnippetAdd = useCallback(() => {
    if (!snippetTitle || !snippetBody) {
      reset();
      return;
    }

    const fields = SnippetParser.getFields(snippetBody, []);

    Messenger.send(DashboardMessage.addSnippet, {
      title: snippetTitle,
      description: snippetDescription || '',
      body: snippetBody,
      fields,
      isMediaSnippet: mediaSnippet
    });

    reset();
  }, [snippetTitle, snippetDescription, snippetBody, mediaSnippet]);

  const reset = () => {
    setShowCreateDialog(false);
    setSnippetTitle('');
    setSnippetDescription('');
    setSnippetBody('');
  };

  useEffect(() => {
    Messenger.send(DashboardMessage.sendTelemetry, {
      event: TelemetryEvent.webviewSnippetsView
    });
  }, []);

  return (
    <PageLayout
      header={
        <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.dashboard.snippets.manage}>
          <div
            className={`py-3 px-4 flex items-center justify-between border-b ${getColors(`border-gray-300 dark:border-vulcan-100`, `border-[var(--frontmatter-border)]`)
              }`}
            aria-label="snippets header"
          >
            <FilterInput
              placeholder="Search"
              isReady={true}
              autoFocus={(snippetKeys && snippetKeys.length > 0)}
              value={snippetFilter}
              onChange={(value: string) => setSnippetFilter(value)}
              onReset={() => setSnippetFilter('')}
            />

            <div className="flex flex-1 justify-end">
              <button
                className={`inline-flex items-center px-3 py-1 rounded text-xs leading-4 font-medium focus:outline-none ${getColors(
                  `text-white dark:text-vulcan-500 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500`,
                  `text-[var(--vscode-button-foreground)] bg-[var(--frontmatter-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50`
                )
                  }`}
                title={`Create new snippet`}
                onClick={() => setShowCreateDialog(true)}
              >
                <PlusSmIcon className={`mr-2 h-6 w-6`} />
                <span className={`text-sm`}>Create new snippet</span>
              </button>
            </div>
          </div>
        </FeatureFlag>
      }
    >
      <div className="flex flex-col h-full">
        {viewData?.data?.filePath && (
          <div className={`text-xl text-center mb-6`}>
            <p>Select the snippet to add to your content.</p>
          </div>
        )}

        {(snippetKeys && snippetKeys.length > 0) ? (
          <ul
            role="list"
            className={`grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8`}
          >
            {snippetKeys.map((snippetKey: any, index: number) => (
              <Item key={index} snippetKey={snippetKey} snippet={snippets[snippetKey]} />
            ))}
          </ul>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className={`flex flex-col items-center ${getColors('text-gray-500 dark:text-whisper-900', 'text-[var(--frontmatter-text)]')
              }`}>
              <CodeIcon className="w-32 h-32" />
              <p className="text-3xl mt-2">No snippets found</p>
              <p className="text-xl mt-4">
                <a
                  className={getColors(`text-teal-700 hover:text-teal-900`, `text-[var(--frontmatter-link)] hover:text-[var(--frontmatter-link-hover)]`)}
                  href={`https://frontmatter.codes/docs/snippets`}
                  title={`Read more to get started with snippets`}
                >
                  Read more to get started with snippets
                </a>
              </p>
            </div>
          </div>
        )}

        {showCreateDialog && (
          <FormDialog
            title={`Create a snippet`}
            description={``}
            isSaveDisabled={!snippetTitle || !snippetBody}
            trigger={onSnippetAdd}
            dismiss={reset}
            okBtnText="Save"
            cancelBtnText="Cancel"
          >
            <NewForm
              title={snippetTitle}
              description={snippetDescription}
              body={snippetBody}
              isMediaSnippet={mediaSnippet}
              onMediaSnippetUpdate={(value: boolean) => setMediaSnippet(value)}
              onTitleUpdate={(value: string) => setSnippetTitle(value)}
              onDescriptionUpdate={(value: string) => setSnippetDescription(value)}
              onBodyUpdate={(value: string) => setSnippetBody(value)}
            />
          </FormDialog>
        )}
      </div>

      <SponsorMsg
        beta={settings?.beta}
        version={settings?.versionInfo}
        isBacker={settings?.isBacker}
      />

      <img className='hidden' src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Ffrontmatter.codes%2Fmetrics%2Fdashboards&slug=snippets" alt="Snippets metrics" />
    </PageLayout>
  );
};
