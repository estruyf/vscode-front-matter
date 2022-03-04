import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { SnippetVariables } from '../../../constants';

export interface INewFormProps {
  title: string;
  description: string;
  body: string;

  onTitleUpdate: (value: string) => void;
  onDescriptionUpdate: (value: string) => void;
  onBodyUpdate: (value: string) => void;
}

export const NewForm: React.FunctionComponent<INewFormProps> = ({ title, description, body, onTitleUpdate, onDescriptionUpdate, onBodyUpdate }: React.PropsWithChildren<INewFormProps>) => {
  const [ showDetails, setShowDetails ] = React.useState(false);

  return (
    <div className='space-y-4'>
      <div>
        <label htmlFor={`title`} className="block text-sm font-medium capitalize">
          Title <span className='text-red-400' title='Required field'>*</span>
        </label>
        <div className="mt-1">
          <input
            type='text'
            name={`title`}
            value={title || ""}
            placeholder={`Snippet title`}
            className="focus:outline-none block w-full sm:text-sm border-gray-300 text-vulcan-500"
            onChange={(e) => onTitleUpdate(e.currentTarget.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`description`} className="block text-sm font-medium capitalize">
          Description
        </label>
        <div className="mt-1">
          <input
            type='text'
            name={`description`}
            value={description || ""}
            placeholder={`Snippet description`}
            className="focus:outline-none block w-full sm:text-sm border-gray-300 text-vulcan-500"
            onChange={(e) => onDescriptionUpdate(e.currentTarget.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`snippet`} className="block text-sm font-medium capitalize">
          Snippet <span className='text-red-400' title='Required field'>*</span>
        </label>
        <div className="mt-1">
          <textarea
            name={`snippet`}
            value={body || ""}
            placeholder={`Snippet content`}
            className="focus:outline-none block w-full sm:text-sm border-gray-300 text-vulcan-500"
            onChange={(e) => onBodyUpdate(e.currentTarget.value)}
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-base text-vulcan-300 dark:text-whisper-500 flex items-center">
          <span>Placeholders guidelines</span>

          {
            showDetails ? (
              <button onClick={() => setShowDetails(false)}>
                <ChevronUpIcon className="w-4 h-4 text-gray-500" />
              </button>
            ) : (
              <button onClick={() => setShowDetails(true)}>
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              </button>
            )
          }
        </h3>
        
        
        <dl className="divide-y divide-gray-200 dark:divide-vulcan-200" style={{ zIndex: -1 }}>
          <div className="py-2 flex justify-between text-xs font-medium">
            <dt className="text-vulcan-100 dark:text-whisper-900">Insert selected text (can still be updated)</dt>
            <dd className="text-vulcan-300 dark:text-whisper-500 text-right">{`\${${SnippetVariables.FM_SELECTED_TEXT}}`}</dd>
          </div>

          <div className="py-2 flex justify-between text-xs font-medium">
            <dt className="text-vulcan-100 dark:text-whisper-900">Variable without default</dt>
            <dd className="text-vulcan-300 dark:text-whisper-500 text-right">{`\${variable}`}</dd>
          </div>

          <div className="py-2 flex justify-between text-xs font-medium">
            <dt className="text-vulcan-100 dark:text-whisper-900">Variable with default</dt>
            <dd className="text-vulcan-300 dark:text-whisper-500 text-right">{`\${variable:default}`}</dd>
          </div>

          <div className="py-2 flex justify-between text-xs font-medium">
            <dt className="text-vulcan-100 dark:text-whisper-900">Variable with choices</dt>
            <dd className="text-vulcan-300 dark:text-whisper-500 text-right">{`\${variable|choice 1,choice 2,choice 3|}`}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};