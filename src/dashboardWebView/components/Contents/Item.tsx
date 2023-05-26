import { useRecoilValue } from 'recoil';
import { MarkdownIcon } from '../../../panelWebView/components/Icons/MarkdownIcon';
import { DashboardMessage } from '../../DashboardMessage';
import { Page } from '../../models/Page';
import { SettingsSelector, ViewSelector } from '../../state';
import { DateField } from '../Common/DateField';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardViewType } from '../../models';
import { ContentActions } from './ContentActions';
import { useEffect, useMemo, useState } from 'react';
import useThemeColors from '../../hooks/useThemeColors';
import { Status } from './Status';
import * as React from 'react';
import useExtensibility from '../../hooks/useExtensibility';

export interface IItemProps extends Page { }

const PREVIEW_IMAGE_FIELD = 'fmPreviewImage';

export const Item: React.FunctionComponent<IItemProps> = ({
  fmFilePath,
  date,
  title,
  description,
  type,
  ...pageData
}: React.PropsWithChildren<IItemProps>) => {
  const view = useRecoilValue(ViewSelector);
  const settings = useRecoilValue(SettingsSelector);
  const draftField = useMemo(() => settings?.draftField, [settings]);
  const cardFields = useMemo(() => settings?.dashboardState?.contents?.cardFields, [settings?.dashboardState?.contents?.cardFields]);
  const { titleHtml, descriptionHtml, dateHtml, statusHtml, tagsHtml, imageHtml, footerHtml } = useExtensibility({
    fmFilePath,
    date,
    title,
    description,
    type,
    pageData
  });
  const { getColors } = useThemeColors();

  const escapedTitle = useMemo(() => {
    console.log('escapedTitle', title, cardFields?.title, pageData);
    let value = title;

    if (cardFields?.title) {
      if (cardFields.title === "description") {
        value = description;
      } else if (cardFields?.title !== "title") {
        value = pageData[cardFields?.title] || title;
      }
    } else if (cardFields?.title === null) {
      return null;
    }

    if (value && typeof value !== 'string') {
      return '<invalid title>';
    }

    return value;
  }, [title, description, cardFields?.title, pageData]);

  const escapedDescription = useMemo(() => {
    let value = description;

    if (cardFields?.description) {
      if (cardFields.description === "title") {
        value = title;
      } else if (cardFields?.description !== "description") {
        value = pageData[cardFields?.description] || description;
      }
    } else if (cardFields?.description === null) {
      return null;
    }

    if (value && typeof value !== 'string') {
      return '<invalid description>';
    }

    return value;
  }, [description, title, cardFields?.description, pageData]);

  const openFile = () => {
    Messenger.send(DashboardMessage.openFile, fmFilePath);
  };

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
      return tagsValue;
    }

    return [];
  }, [settings, pageData]);

  const hasDraftOrDate = useMemo(() => {
    return cardFields && (cardFields.state || cardFields.date);
  }, [cardFields]);

  if (view === DashboardViewType.Grid) {
    return (
      <li className="relative">
        <div
          className={`group flex flex-col items-start content-start h-full w-full text-left shadow-md dark:shadow-none hover:shadow-xl border rounded ${getColors(
            'bg-gray-50 dark:bg-vulcan-200 text-vulcan-500 dark:text-whisper-500 dark:hover:bg-vulcan-100 border-gray-200 dark:border-vulcan-50',
            'bg-[var(--vscode-sideBar-background)] hover:bg-[var(--vscode-list-hoverBackground)] text-[var(--vscode-sideBarTitle-foreground)] border-[var(--frontmatter-border)]'
          )
            }`}
        >
          <button
            onClick={openFile}
            className={`relative h-36 w-full overflow-hidden border-b cursor-pointer ${getColors(
              'border-gray-100 dark:border-vulcan-100 dark:group-hover:border-vulcan-200',
              'border-[var(--frontmatter-border)]'
            )
              }`}
          >
            {
              imageHtml ?
                <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: imageHtml }} /> :
                pageData[PREVIEW_IMAGE_FIELD] ? (
                  <img
                    src={`${pageData[PREVIEW_IMAGE_FIELD]}`}
                    alt={escapedTitle || ""}
                    className="absolute inset-0 h-full w-full object-cover group-hover:brightness-75"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={`flex items-center justify-center ${getColors(
                      'bg-whisper-500 dark:bg-vulcan-200 dark:group-hover:bg-vulcan-100',
                      'bg-[var(--vscode-sideBar-background)] group-hover:bg-[var(--vscode-list-hoverBackground)]'
                    )
                      }`}
                  >
                    <MarkdownIcon className={`h-32 ${getColors(
                      'text-vulcan-100 dark:text-whisper-100',
                      'text-[var(--vscode-sideBarTitle-foreground)] opacity-80'
                    )
                      }`} />
                  </div>
                )
            }
          </button>

          <div className="relative p-4 w-full grow">
            <div className={`flex justify-between items-center ${hasDraftOrDate ? `mb-2` : ``}`}>
              {
                statusHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: statusHtml }} />
                ) : (
                  cardFields?.state && draftField && draftField.name && <Status draft={pageData[draftField.name]} />
                )
              }

              {
                dateHtml ? (
                  <div className='mr-4' dangerouslySetInnerHTML={{ __html: dateHtml }} />
                ) : (
                  cardFields?.date && <DateField className={`mr-4`} value={date} />
                )
              }
            </div>

            <ContentActions
              title={title}
              path={fmFilePath}
              scripts={settings?.scripts}
              onOpen={openFile}
            />

            <button onClick={openFile} className={`text-left block`}>
              {
                titleHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: titleHtml }} />
                ) : (
                  <h2 className="mb-2 font-bold">
                    {escapedTitle}
                  </h2>
                )
              }
            </button>

            <button onClick={openFile} className={`text-left block`}>
              {
                descriptionHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                ) : (
                  <p className={`text-xs ${getColors('text-vulcan-200 dark:text-whisper-800', 'text-[vara(--vscode-titleBar-activeForeground)]')}`}>{escapedDescription}</p>
                )
              }
            </button>

            {
              tagsHtml ? (
                <div className="mt-2" dangerouslySetInnerHTML={{ __html: tagsHtml }} />
              ) : (
                tags && tags.length > 0 && (
                  <div className="mt-2">
                    {tags.map(
                      (tag, index) => tag && (
                        <span
                          key={index}
                          className={`inline-block mr-1 mt-1 text-xs ${getColors(
                            `text-[#5D561D] dark:text-[#F0ECD0]`,
                            `text-[var(--vscode-textPreformat-foreground)]`
                          )
                            }`}
                        >
                          #{tag}
                        </span>
                      )
                    )}
                  </div>
                )
              )
            }
          </div>

          {
            footerHtml && (
              <div className="placeholder__card__footer p-4 w-full" dangerouslySetInnerHTML={{ __html: footerHtml }} />
            )
          }
        </div>
      </li>
    );
  } else if (view === DashboardViewType.List) {
    return (
      <li className="relative">
        <div
          className={`px-5 cursor-pointer w-full text-left grid grid-cols-12 gap-x-4 sm:gap-x-6 xl:gap-x-8 py-2 border-b hover:bg-opacity-70 ${getColors(
            `border-gray-300 hover:bg-gray-200 dark:border-vulcan-50 dark:hover:bg-vulcan-50`,
            `border-[var(--frontmatter-border)] hover:bg-[var(--vscode-sideBar-background)]`
          )
            }`}
        >
          <div className="col-span-8 font-bold truncate flex items-center space-x-4">
            <button title={`Open: ${escapedTitle}`} onClick={openFile}>
              {escapedTitle}
            </button>

            <ContentActions
              title={escapedTitle || ""}
              path={fmFilePath}
              scripts={settings?.scripts}
              onOpen={openFile}
              listView
            />
          </div>
          <div className="col-span-2">
            <DateField value={date} />
          </div>
          <div className="col-span-2">
            {draftField && draftField.name && <Status draft={pageData[draftField.name]} />}
          </div>
        </div>
      </li>
    );
  }

  return null;
};
