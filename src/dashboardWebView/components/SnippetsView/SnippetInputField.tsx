import * as React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Choice, SnippetField, SnippetInfoField } from '../../../models';
import { useEffect } from 'react';
import { TextField } from '../Common/TextField';

export interface ISnippetInputFieldProps {
  field: SnippetField;
  fieldInfo?: SnippetInfoField[];
  onValueChange: (field: SnippetField, value: string) => void;
}

export const SnippetInputField: React.FunctionComponent<ISnippetInputFieldProps> = ({
  field,
  fieldInfo,
  onValueChange
}: React.PropsWithChildren<ISnippetInputFieldProps>) => {

  useEffect(() => {
    if (fieldInfo) {
      const info = fieldInfo.find((f) => f.name === field.name);
      if (info) {
        onValueChange(field, info.value || '');
      }
    }
  }, [fieldInfo]);

  if (field.type === 'choice') {
    return (
      <>
        <div className="relative">
          <select
            name={field.name}
            value={field.value || ''}
            className={`block w-full sm:text-sm pr-2 appearance-none disabled:opacity-50 rounded bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] placeholder-[var(--vscode-input-placeholderForeground)] border-[var(--frontmatter-border)] focus:border-[var(--vscode-focusBorder)] focus:outline-0`}
            style={{
              boxShadow: "none"
            }}
            onChange={(e) => onValueChange(field, e.target.value)}
          >
            {(field.choices || [])?.map((option: string | Choice, index: number) =>
              typeof option === 'string' ? (
                <option key={index} value={option}>
                  {option}
                </option>
              ) : (
                <option key={index} value={option.id}>
                  {option.title}
                </option>
              )
            )}
          </select>

          <ChevronDownIcon className="absolute top-3 right-2 w-4 h-4 text-gray-500" />
        </div>

        {
          field.description && (
            <p className="text-xs text-[var(--vscode--settings-headerForeground)] opacity-75 mt-2 mx-2">
              {field.description}
            </p>
          )
        }
      </>
    );
  }

  if (field.type === 'string' && !field.single) {
    return (
      <TextField
        name={field.name}
        value={field.value || ''}
        description={field.description}
        onChange={(e) => onValueChange(field, e)}
        rows={4}
        multiline
      />
    );
  }

  return (
    <TextField
      name={field.name}
      value={field.value || ''}
      description={field.description}
      onChange={(e) => onValueChange(field, e)}
    />
  );
};
