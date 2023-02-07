import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { GeneralCommands } from '../../../constants';
import useThemeColors from '../../hooks/useThemeColors';
import { SnippetInput } from './SnippetInput';

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
      'https://frontmatter.codes/docs/markdown#placeholders'
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`title`} className="block text-sm font-medium capitalize">
          Title{' '}
          <span className={getColors(`text-red-400`, `text-[var(--vscode-notificationsErrorIcon-foreground)]`)} title="Required field">
            *
          </span>
        </label>
        <div className="mt-1">
          <SnippetInput 
            name='title'
            value={title}
            placeholder='Snippet title'
            onChange={(e) => onTitleUpdate(e.currentTarget.value)}
            />
        </div>
      </div>

      <div>
        <label htmlFor={`description`} className="block text-sm font-medium capitalize">
          Description
        </label>
        <div className="mt-1">
          <SnippetInput 
            name='description'
            value={description}
            placeholder='Snippet description'
            onChange={(e) => onDescriptionUpdate(e.currentTarget.value)}
            />
        </div>
      </div>

      <div>
        <label htmlFor={`snippet`} className="block text-sm font-medium capitalize">
          Snippet{' '}
          <span className="text-red-400" title="Required field">
            *
          </span>
        </label>
        <div className="mt-1">
          <SnippetInput 
            name='snippet'
            value={body}
            placeholder='Snippet content'
            onChange={(e) => onBodyUpdate(e.currentTarget.value)}
            isTextArea
            />
        </div>
      </div>

      <div>
        <label htmlFor={`snippet`} className="block text-sm font-medium">
          Is a media snippet?
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
              className={`h-4 w-4 rounded ${
                getColors(
                  `focus:ring-teal-500 text-teal-600 border-gray-300 dark:border-vulcan-50`,
                  `focus:ring-[var(--vscode-button-background)] text-[var(--vscode-button-background)] border-[var(--vscode-editorWidget-border)]`
                )
              }`}
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="isMediaSnippet"
              className={`font-medium ${
                getColors(`text-vulcan-100 dark:text-whisper-900`, `text-[var(--vscode-editor-foreground)]`)
              }`}
            >
              Media snippet
            </label>
            <p id="isMediaSnippet-description" className={getColors('text-vulcan-300 dark:text-whisper-500', `text-[var(--vscode-foreground)]`)}>
              Use the current snippet for inserting media files into your content.
            </p>
            <p>
              Check our{' '}
              <button
                className={getColors('text-teal-700 hover:text-teal-500', 'text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground)]')}
                onClick={openLink}
                title="media snippet placeholders"
              >
                media snippet placeholders
              </button>{' '}
              documentation to know which placeholders you can use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
