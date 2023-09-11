import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { GeneralCommands } from '../../../constants';
import useThemeColors from '../../hooks/useThemeColors';
import { SnippetInput } from './SnippetInput';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface INewFormProps {
  title: string;
  description: string;
  body: string;
  isMediaSnippet: boolean;

  onMediaSnippetUpdate: (value: boolean) => void;
  onTitleUpdate: (value: string) => void;
  onDescriptionUpdate: (value: string) => void;
  onBodyUpdate: (value: string) => void;
}

export const NewForm: React.FunctionComponent<INewFormProps> = ({
  title,
  description,
  body,
  isMediaSnippet,
  onMediaSnippetUpdate,
  onTitleUpdate,
  onDescriptionUpdate,
  onBodyUpdate
}: React.PropsWithChildren<INewFormProps>) => {
  const { getColors } = useThemeColors();

  const openLink = () => {
    Messenger.send(
      GeneralCommands.toVSCode.openLink,
      'https://frontmatter.codes/docs/snippets#placeholders'
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`title`} className="block text-sm font-medium capitalize">
          {l10n.t(LocalizationKey.commonTitle)}
          {' '}
          <span className={getColors(`text-red-400`, `text-[var(--vscode-notificationsErrorIcon-foreground)]`)} title="Required field">
            *
          </span>
        </label>
        <div className="mt-1">
          <SnippetInput
            name='title'
            value={title}
            placeholder={l10n.t(LocalizationKey.dashboardSnippetsViewNewFormSnippetInputTitlePlaceholder)}
            onChange={(e) => onTitleUpdate(e.currentTarget.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`description`} className="block text-sm font-medium capitalize">
          {l10n.t(LocalizationKey.dashboardSnippetsViewNewFormSnippetInputDescriptionLabel)}
        </label>
        <div className="mt-1">
          <SnippetInput
            name='description'
            value={description}
            placeholder={l10n.t(LocalizationKey.dashboardSnippetsViewNewFormSnippetInputDescriptionPlaceholder)}
            onChange={(e) => onDescriptionUpdate(e.currentTarget.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`snippet`} className="block text-sm font-medium capitalize">
          {l10n.t(LocalizationKey.dashboardSnippetsViewNewFormSnippetInputSnippetLabel)}
          {' '}
          <span className="text-red-400" title="Required field">
            *
          </span>
        </label>
        <div className="mt-1">
          <SnippetInput
            name='snippet'
            value={body}
            placeholder={l10n.t(LocalizationKey.dashboardSnippetsViewNewFormSnippetInputSnippetPlaceholder)}
            onChange={(e) => onBodyUpdate(e.currentTarget.value)}
            isTextArea
          />
        </div>
      </div>

      <div>
        <label htmlFor={`isMediaSnippet`} className="block text-sm font-medium">
          {l10n.t(LocalizationKey.dashboardSnippetsViewNewFormSnippetInputIsMediaSnippetLabel)}
        </label>
        <div className="mt-1 relative flex items-start">
          <div className="flex items-center h-5">
            <input
              id="isMediaSnippet"
              aria-describedby="isMediaSnippet-description"
              name="isMediaSnippet"
              type="checkbox"
              checked={isMediaSnippet}
              onChange={(e) => onMediaSnippetUpdate(e.currentTarget.checked)}
              className={`h-4 w-4 rounded ${getColors(
                `focus:ring-teal-500 text-teal-600 border-gray-300 dark:border-vulcan-50`,
                `focus:ring-[var(--frontmatter-button-background)] text-[var(--frontmatter-button-background)] border-[var(--vscode-editorWidget-border)]`
              )
                }`}
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="isMediaSnippet"
              className={`font-medium ${getColors(`text-vulcan-100 dark:text-whisper-900`, `text-[var(--vscode-editor-foreground)]`)
                }`}
            >
              {l10n.t(LocalizationKey.dashboardSnippetsViewNewFormSnippetInputIsMediaSnippetCheckboxLabel)}
            </label>
            <p id="isMediaSnippet-description" className={`text-[var(--vscode-foreground)] text-left`}>
              {l10n.t(LocalizationKey.dashboardSnippetsViewNewFormSnippetInputIsMediaSnippetCheckboxDescription)}
            </p>
            <p>
              <button
                className={`text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground) text-left`}
                onClick={openLink}
                title={l10n.t(LocalizationKey.dashboardSnippetsViewNewFormSnippetInputDocsButtonTitle)}
              >
                {l10n.t(LocalizationKey.dashboardSnippetsViewNewFormSnippetInputDocsButtonDescription)}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
