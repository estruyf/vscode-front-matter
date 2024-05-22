import { Messenger } from '@estruyf/vscode/dist/client';
import { CodeBracketIcon, PlusIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FeatureFlag } from '../../../components/features/FeatureFlag';
import { FEATURE_FLAG, GeneralCommands, WEBSITE_LINKS } from '../../../constants';
import { TelemetryEvent } from '../../../constants/TelemetryEvent';
import { SnippetParser } from '../../../helpers/SnippetParser';
import { DashboardMessage } from '../../DashboardMessage';
import { ModeAtom, SettingsSelector, ViewDataSelector } from '../../state';
import { FilterInput } from '../Header/FilterInput';
import { PageLayout } from '../Layout/PageLayout';
import { SponsorMsg } from '../Layout/SponsorMsg';
import { Item } from './Item';
import { NewForm } from './NewForm';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { List } from '../Media/List';
import { SlideOver } from '../Modals/SlideOver';

export interface ISnippetsProps { }

export const Snippets: React.FunctionComponent<ISnippetsProps> = (
  _: React.PropsWithChildren<ISnippetsProps>
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

  const snippets = settings?.snippets || {};
  const snippetKeys = useMemo(() => {
    let allSnippetKeys = Object.keys(snippets).sort((a, b) => a.localeCompare(b));

    if (viewData?.data?.filePath) {
      allSnippetKeys = allSnippetKeys.filter((key) => {
        return !snippets[key].isMediaSnippet;
      });
    }

    return allSnippetKeys.filter((key) => {
      const value = snippetFilter.toLowerCase();
      const keyValue = key.toLowerCase();
      const descriptionValue = snippets[key].description?.toLowerCase() || '';

      // Contains in key or description, values included in key are ranked higher (sort and fuzzy search)
      return keyValue.includes(value) || descriptionValue.includes(value);
    });
  }, [settings?.snippets, snippetFilter, viewData?.data?.filePath]);

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
    Messenger.send(DashboardMessage.setTitle, l10n.t(LocalizationKey.dashboardHeaderTabsSnippets));

    Messenger.send(DashboardMessage.sendTelemetry, {
      event: TelemetryEvent.webviewSnippetsView
    });

    Messenger.send(GeneralCommands.toVSCode.logging.info, {
      message: `Snippets view loaded`,
      location: 'DASHBOARD'
    });
  }, []);

  return (
    <PageLayout
      header={
        <FeatureFlag features={mode?.features || []} flag={FEATURE_FLAG.dashboard.snippets.manage}>
          <div
            className={`py-3 px-4 flex items-center justify-between border-b border-[var(--frontmatter-border)]`}
            aria-label={l10n.t(LocalizationKey.dashboardSnippetsViewSnippetsAriaLabel)}
          >
            <FilterInput
              placeholder={l10n.t(LocalizationKey.commonSearch)}
              isReady={true}
              autoFocus={(snippetKeys && snippetKeys.length > 0)}
              value={snippetFilter}
              onChange={(value: string) => setSnippetFilter(value)}
              onReset={() => setSnippetFilter('')}
            />

            <div className="flex flex-1 justify-end">
              <button
                className={`inline-flex items-center px-3 py-1 rounded text-xs leading-4 font-medium focus:outline-none text-[var(--vscode-button-foreground)] bg-[var(--frontmatter-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50`}
                title={l10n.t(LocalizationKey.dashboardSnippetsViewSnippetsButtonCreate)}
                onClick={() => setShowCreateDialog(true)}
              >
                <PlusIcon className={`mr-2 h-6 w-6`} />
                <span className={`text-sm`}>
                  {l10n.t(LocalizationKey.dashboardSnippetsViewSnippetsButtonCreate)}
                </span>
              </button>
            </div>
          </div>
        </FeatureFlag>
      }
    >
      <div className="flex flex-col h-full">
        {viewData?.data?.filePath && (
          <div className={`text-xl text-center mb-6`}>
            <p>
              {l10n.t(LocalizationKey.dashboardSnippetsViewSnippetsSelectDescription)}
            </p>
          </div>
        )}

        {(snippetKeys && snippetKeys.length > 0) ? (
          <List
            gap={4}
          >
            {snippetKeys.map((snippetKey: any, index: number) => (
              <Item key={index} snippetKey={snippetKey} snippet={snippets[snippetKey]} />
            ))}
          </List>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className={`flex flex-col items-center text-[var(--frontmatter-text)]`}>
              <CodeBracketIcon className="w-32 h-32" />
              <p className="text-3xl mt-2">
                {l10n.t(LocalizationKey.dashboardSnippetsViewSnippetsEmptyMessage)}
              </p>
              <p className="text-xl mt-4">
                <a
                  className={`text-[var(--frontmatter-link)] hover:text-[var(--frontmatter-link-hover)]`}
                  href={WEBSITE_LINKS.docs.snippets}
                  title={l10n.t(LocalizationKey.dashboardSnippetsViewSnippetsReadMore)}
                >
                  {l10n.t(LocalizationKey.dashboardSnippetsViewSnippetsReadMore)}
                </a>
              </p>
            </div>
          </div>
        )}

        {showCreateDialog && (
          <SlideOver
            title={l10n.t(LocalizationKey.dashboardSnippetsViewSnippetsFormDialogTitle)}
            description={``}
            isSaveDisabled={!snippetTitle || !snippetBody}
            trigger={onSnippetAdd}
            dismiss={reset}
            okBtnText={l10n.t(LocalizationKey.commonSave)}
            cancelBtnText={l10n.t(LocalizationKey.commonCancel)}
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
          </SlideOver>
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
