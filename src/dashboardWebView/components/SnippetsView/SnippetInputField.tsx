import * as React from 'react';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { Choice, SnippetField } from '../../../models';

export interface ISnippetInputFieldProps {
  field: SnippetField;
  onValueChange: (field: SnippetField, value: string) => void
}

export const SnippetInputField: React.FunctionComponent<ISnippetInputFieldProps> = ({ field, onValueChange }: React.PropsWithChildren<ISnippetInputFieldProps>) => {

  if (field.type === 'choice') {
    return (
      <div className='relative'>
        <select 
          name={field.name} 
          value={field.value || ""}
          className="focus:outline-none block w-full sm:text-sm border-gray-300 text-vulcan-500"
          onChange={e => onValueChange(field, e.target.value)}>
          {
            (field.choices || [])?.map((option: string | Choice, index: number) => (
              typeof option === 'string' ?
                <option key={index} value={option}>{option}</option> :
                <option key={index} value={option.id}>{option.title}</option>
            ))
          }
        </select>

        <ChevronDownIcon className="absolute top-3 right-2 w-4 h-4 text-gray-500" />
      </div>
    )
  }
  
  if (field.type === 'string' && !field.single) {
    return (
      <textarea
        name={field.name}
        value={field.value || ""}
        className="focus:outline-none block w-full sm:text-sm border-gray-300 text-vulcan-500 h-auto"
        onChange={(e) => onValueChange(field, e.currentTarget.value)}
        rows={4}
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