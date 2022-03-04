import * as React from 'react';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { SnippetField } from '../../../models';
import { SnippetVariables } from '../../../constants';

export interface ISnippetInputFieldProps {
  field: SnippetField;
  onValueChange: (field: SnippetField, value: string) => void
}

export const SnippetInputField: React.FunctionComponent<ISnippetInputFieldProps> = ({ field, onValueChange }: React.PropsWithChildren<ISnippetInputFieldProps>) => {

  if (field.type === 'select') {
    return (
      <div className='relative'>
        <select 
          name={field.name} 
          value={field.value || ""}
          className="focus:outline-none block w-full sm:text-sm border-gray-300 text-vulcan-500" 
          onChange={e => onValueChange(field, e.target.value)}>
          {
            field.options?.map((option: string, index: number) => (
              <option key={index} value={option}>{option}</option>
            ))
          }
        </select>

        <ChevronDownIcon className="absolute top-3 right-2 w-4 h-4 text-gray-500" />
      </div>
    )
  }
  
  if (field.type === 'textarea') {
    return (
      <textarea
        name={field.name}
        value={field.value || ""}
        className="focus:outline-none block w-full sm:text-sm border-gray-300 text-vulcan-500"
        onChange={(e) => onValueChange(field, e.currentTarget.value)}
      />
    )
  }

  return (
    <input
      type="text"
      name={field.name}
      value={field.value || ""}
      className="focus:outline-none block w-full sm:text-sm border-gray-300 text-vulcan-500"
      onChange={(e) => onValueChange(field, e.currentTarget.value)}
    />
  );
};