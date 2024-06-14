import { useRecoilValue } from 'recoil';
import { MarkdownIcon } from '../../../panelWebView/components/Icons/MarkdownIcon';
import { Page } from '../../models/Page';
import { SettingsSelector, ViewSelector } from '../../state';
import { DateField } from '../Common/DateField';
import { DashboardViewType } from '../../models';
import { ContentActions } from './ContentActions';
import { useMemo } from 'react';
import { Status } from './Status';
import * as React from 'react';
import useExtensibility from '../../hooks/useExtensibility';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import useCard from '../../hooks/useCard';
import { I18nLabel } from './I18nLabel';
import { ItemSelection } from '../Common/ItemSelection';
import { openFile } from '../../utils';
import { FooterActions } from './FooterActions';
import useSelectedItems from '../../hooks/useSelectedItems';
import { cn } from '../../../utils/cn';
import { Tags } from './Tags';

export interface IItemProps extends Page { }

const PREVIEW_IMAGE_FIELD = 'fmPreviewImage';

export const Item: React.FunctionComponent<IItemProps> = ({
  ...pageData
}: React.PropsWithChildren<IItemProps>) => {
  const { selectedFiles } = useSelectedItems();
  const view = useRecoilValue(ViewSelector);
  const settings = useRecoilValue(SettingsSelector);
  const draftField = useMemo(() => settings?.draftField, [settings]);
  const cardFields = useMemo(() => settings?.dashboardState?.contents?.cardFields, [settings?.dashboardState?.contents?.cardFields]);
  const { escapedTitle, escapedDescription } = useCard(pageData, settings?.dashboardState?.contents?.cardFields);
  const { titleHtml, descriptionHtml, dateHtml, statusHtml, tagsHtml, imageHtml, footerHtml } = useExtensibility({
    fmFilePath: pageData.fmFilePath,
    date: pageData.date,
    title: pageData.title,
    description: pageData.description,
    type: pageData.type,
    pageData
  });

  const isSelected = useMemo(() => selectedFiles.includes(pageData.fmFilePath), [selectedFiles, pageData.fmFilePath]);

  const onOpenFile = React.useCallback(() => {
    openFile(pageData.fmFilePath);
  }, [pageData.fmFilePath]);

  const tags: string[] | undefined = useMemo(() => {
    if (!settings?.dashboardState?.contents?.tags) {
      return undefined;
    }

    const tagField = settings.dashboardState.contents.tags;
    let tagsValue = [];

    if (tagField === 'tags') {
      tagsValue = pageData.fmTags;
    } else if (tagField === 'categories') {
      tagsValue = pageData.fmCategories;
    } else {
      tagsValue = pageData[tagField] || [];
    }

    if (typeof tagsValue === 'string') {
      return [tagsValue];
    } else if (Array.isArray(tagsValue)) {
      const items = tagsValue.map(t => typeof t === 'string' ? t : undefined);
      return items.filter(t => t !== undefined) as string[];
    }

    return [];
  }, [settings, pageData]);

  const statusPlaceholder = useMemo(() => {
    if (!statusHtml && !cardFields?.state) {
      return null;
    }

    return (
      statusHtml ? (
        <div dangerouslySetInnerHTML={{ __html: statusHtml }} />
      ) : (
        cardFields?.state && draftField && draftField.name && typeof pageData[draftField.name] !== "undefined" ? <Status draft={pageData[draftField.name]} published={pageData.fmPublished} /> : null
      )
    )
  }, [statusHtml, cardFields?.state, draftField, pageData]);

  const datePlaceholder = useMemo(() => {
    if (!dateHtml && !cardFields?.date) {
      return null;
    }

    return (
      dateHtml ? (
        <div className='mr-6' dangerouslySetInnerHTML={{ __html: dateHtml }} />
      ) : (
        cardFields?.date && pageData.date ? <DateField className={`mr-6`} value={pageData.date} format={pageData.fmDateFormat} /> : null
      )
    )
  }, [dateHtml, cardFields?.date, pageData]);

  const hasDraftOrDate = useMemo(() => {
    return cardFields && (cardFields.state || cardFields.date);
  }, [cardFields]);

  if (view === DashboardViewType.Grid) {
    return (
      <li className="relative">
        <div
          className={cn(`group flex flex-col items-start content-start h-full w-full text-left shadow-md dark:shadow-none hover:shadow-xl border rounded bg-[var(--vscode-sideBar-background)] hover:bg-[var(--vscode-list-hoverBackground)] text-[var(--vscode-sideBarTitle-foreground)] border-[var(--frontmatter-border)]`, isSelected && `border-[var(--frontmatter-border-active)]`)}
        >
          <button
            title={escapedTitle ? l10n.t(LocalizationKey.commonOpenWithValue, escapedTitle) : l10n.t(LocalizationKey.commonOpen)}
            onClick={onOpenFile}
            className={`relative rounded-t h-36 w-full overflow-hidden border-b cursor-pointer border-[var(--frontmatter-border)]`}
          >
            {
              imageHtml ?
                <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: imageHtml }} /> :
                pageData[PREVIEW_IMAGE_FIELD] ? (
                  <img
                    src={`${pageData[PREVIEW_IMAGE_FIELD]}`}
                    alt={escapedTitle || ""}
                    className="absolute inset-0 h-full w-full object-cover object-left-top group-hover:brightness-75"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={`h-full flex items-center justify-center bg-[var(--vscode-sideBar-background)] group-hover:bg-[var(--vscode-list-hoverBackground)]`}
                  >
                    <MarkdownIcon className={`h-32 text-[var(--vscode-sideBarTitle-foreground)] opacity-80`} />
                  </div>
                )
            }
          </button>

          <ItemSelection filePath={pageData.fmFilePath} />

          <div className="relative p-4 w-full grow">
            {
              (statusPlaceholder || datePlaceholder) && (
                <div className={`space-y-2 ${hasDraftOrDate ? `mb-2` : ``}`}>
                  <div>{statusPlaceholder}</div>
                  <div>{datePlaceholder}</div>
                </div>
              )
            }

            <ContentActions
              path={pageData.fmFilePath}
              relPath={pageData.fmRelFileWsPath}
              contentType={pageData.fmContentType}
              locale={pageData.fmLocale}
              isDefaultLocale={pageData.fmDefaultLocale}
              translations={pageData.fmTranslations}
              scripts={settings?.scripts}
              onOpen={onOpenFile}
            />

            <I18nLabel page={pageData} />

            <button
              title={escapedTitle ? l10n.t(LocalizationKey.commonOpenWithValue, escapedTitle) : l10n.t(LocalizationKey.commonOpen)}
              onClick={onOpenFile}
              className={`text-left block`}>
              {
                titleHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: titleHtml }} />
                ) : (
                  <h2 className="font-bold">
                    <span>{escapedTitle}</span>
                  </h2>
                )
              }
            </button>

            {
              (escapedDescription || descriptionHtml) && (
                <button
                  title={escapedTitle ? l10n.t(LocalizationKey.commonOpenWithValue, escapedTitle) : l10n.t(LocalizationKey.commonOpen)}
                  onClick={onOpenFile}
                  className={`mt-2 text-left block`}>
                  {
                    descriptionHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                    ) : (
                      <p className={`text-xs text-[var(--frontmatter-secondary-text)]`}>{escapedDescription}</p>
                    )
                  }
                </button>
              )
            }

            {
              tagsHtml ? (
                <div className="mt-2" dangerouslySetInnerHTML={{ __html: tagsHtml }} />
              ) : (
                <Tags values={tags} tagField={settings?.dashboardState?.contents?.tags} />
              )
            }
          </div>

          {
            footerHtml && (
              <div className="placeholder__card__footer p-4 w-full" dangerouslySetInnerHTML={{ __html: footerHtml }} />
            )
          }

          <FooterActions
            filePath={pageData.fmFilePath}
            contentType={pageData.fmContentType}
            websiteUrl={settings?.websiteUrl}
            scripts={settings?.scripts} />
        </div>
      </li>
    );
  } else if (view === DashboardViewType.List) {
    return (
      <li className="relative">
        <div
          className={`px-5 cursor-pointer w-full text-left grid grid-cols-12 gap-x-4 sm:gap-x-6 xl:gap-x-8 py-2 border-b hover:bg-opacity-70 border-[var(--frontmatter-border)] hover:bg-[var(--vscode-sideBar-background)]`}
        >
          <div className="col-span-8 font-bold truncate flex items-center space-x-4">
            <ItemSelection filePath={pageData.fmFilePath} show />

            <button
              title={escapedTitle ? l10n.t(LocalizationKey.commonOpenWithValue, escapedTitle) : l10n.t(LocalizationKey.commonOpen)}
              onClick={onOpenFile}>
              {escapedTitle}
            </button>

            <ContentActions
              path={pageData.fmFilePath}
              relPath={pageData.fmRelFileWsPath}
              contentType={pageData.fmContentType}
              scripts={settings?.scripts}
              onOpen={onOpenFile}
              listView
            />
          </div>
          <div className="col-span-2">
            <DateField value={pageData.date} />
          </div>
          <div className="col-span-2">
            {draftField && draftField.name && <Status draft={pageData[draftField.name]} published={pageData.fmPublished} />}
          </div>
        </div>
      </li>
    );
  }

  return null;
};
