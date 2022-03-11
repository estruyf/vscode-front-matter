import * as React from 'react';

export interface INewFormProps {
  title: string;
  description: string;
  body: string;

  onTitleUpdate: (value: string) => void;
  onDescriptionUpdate: (value: string) => void;
  onBodyUpdate: (value: string) => void;
}

export const NewForm: React.FunctionComponent<INewFormProps> = ({ title, description, body, onTitleUpdate, onDescriptionUpdate, onBodyUpdate }: React.PropsWithChildren<INewFormProps>) => {

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
    </div>
  );
};