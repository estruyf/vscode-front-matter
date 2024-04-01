import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { GeneralCommands, WEBSITE_LINKS } from '../../../constants';
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
  const openLink = () => {
    Messenger.send(
      GeneralCommands.toVSCode.openLink,
      WEBSITE_LINKS.docs.snippetsPlaceholders
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`title`} className="block text-sm font-medium capitalize">
          {l10n.t(LocalizationKey.commonTitle)}
          {' '}
          <span className={`text-[var(--vscode-editorError-foreground)]`} title={l10n.t(LocalizationKey.fieldRequired)}>
            *
          </span>
        </label>
        <div className="mt-1">
          <SnippetInput
            name='title'
            value={title}
            placeholder={l10n.t(LocalizationKey.dashboardSnippetsViewNewFormSnippetInputTitlePlaceholder)}
            onChange={(e) => onTitleUpdate(e)}
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
            onChange={(e) => onDescriptionUpdate(e)}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`snippet`} className="block text-sm font-medium capitalize">
          {l10n.t(LocalizationKey.dashboardSnippetsViewNewFormSnippetInputSnippetLabel)}
          {' '}
          <span className="text-[var(--vscode-editorError-foreground)]" title={l10n.t(LocalizationKey.fieldRequired)}>
            *
          </span>
        </label>
        <div className="mt-1">
          <SnippetInput
            name='snippet'
            value={body}
            placeholder={l10n.t(LocalizationKey.dashboardSnippetsViewNewFormSnippetInputSnippetPlaceholder)}
            onChange={(e) => onBodyUpdate(e)}
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
              className={`h-4 w-4 rounded focus:ring-[var(--frontmatter-button-background)] text-[var(--frontmatter-button-background)] border-[var(--frontmatter-border)]`}
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="isMediaSnippet"
              className={`font-medium text-[var(--vscode-editor-foreground)]`}
            >
              {l10n.t(LocalizationKey.dashboardSnippetsViewNewFormSnippetInputIsMediaSnippetCheckboxLabel)}
            </label>
            <p id="isMediaSnippet-description" className={`text-[var(--frontmatter-text)] text-left`}>
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
