import { Messenger } from '@estruyf/vscode/dist/client';
import { ChevronDownIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Choice, SnippetParser, Variable, VariableResolver } from '../../../helpers/SnippetParser';
import { DashboardMessage } from '../../DashboardMessage';
import { ViewDataSelector } from '../../state';


export interface ISnippetFormProps {
  snippet: any;
  selection: string | undefined;
}

export interface SnippetFormHandle {
  onSave: () => void;
}

interface SnippetField {
  name: string;
  value: string;
  type: 'text' | 'select';
  tmString: string;
  options?: string[];
}

const SnippetForm: React.ForwardRefRenderFunction<SnippetFormHandle, ISnippetFormProps> = ({ snippet, selection }, ref) => {
  const viewData = useRecoilValue(ViewDataSelector);
  const [ fields, setFields ] = useState<SnippetField[]>([]);

  const onTextChange = useCallback((field: SnippetField, value: string) => {
    setFields(prevFields => prevFields.map(f => f.name === field.name ? { ...f, value } : f));
  }, [setFields]);

  const insertSelectionValue = useCallback((fieldName: string) => {
    if (selection && fieldName === 'selection') {
      return selection;
    }

    return;
  }, [selection]);

  const snippetBody = useMemo(() => {
    let body = snippet.body.join(`\n`);

    for (const field of fields) {
      body = body.replace(field.tmString, field.value);
    }

    return body;
  }, [fields, selection]);

  useImperativeHandle(ref, () => ({
    onSave() {
      if (!snippetBody) {
        return;
      }
  
      Messenger.send(DashboardMessage.insertSnippet, {
        file: viewData?.data?.filePath,
        snippet: snippetBody
      });
    }
  }));

  useEffect(() => {
    const snippetParser = new SnippetParser();
    const body = snippet.body.join(`\n`);

    const parsed = snippetParser.parse(body);
    const placeholders = parsed.placeholderInfo.all;

    const allFields: any[] = [];

    for (const placeholder of placeholders) {
      const tmString = placeholder.toTextmateString();

      if (placeholder.children.length === 0) {
        allFields.push({
          type: 'text',
          name: placeholder.index,
          value: insertSelectionValue(placeholder.index as string) || '',
          tmString
        });
      } else {
        for (const child of placeholder.children as any[]) {
          if (child instanceof Choice) {
            const options = child.options.map(o => o.value);

            allFields.push({
              type: 'select',
              name: placeholder.index,
              value: (child as any).value || options[0] || "",
              options,
              tmString
            });
          } else {
            allFields.push({
              type: 'text',
              name: placeholder.index,
              value: insertSelectionValue(placeholder.index as string) || (child as any).value || "",
              tmString
            });
          }
        }
      }
    }

    setFields(allFields);
  }, []);

  return (
    <div>
      <pre className='border border-opacity-40 p-2 whitespace-pre-wrap break-words'>
        {snippetBody}
      </pre>

      <div className='space-y-4 mt-4'>
        {
          fields.map((field: SnippetField, index: number) => (
            <div key={index}>
              <label htmlFor={field.name} className="block text-sm font-medium capitalize">
                {field.name}
              </label>
              <div className="mt-1">
                {
                  field.type === 'select' ? (
                    <div className='relative'>
                      <select 
                        name={field.name} 
                        value={field.value || ""}
                        className="focus:outline-none block w-full sm:text-sm border-gray-300 text-vulcan-500" 
                        onChange={e => onTextChange(field, e.target.value)}>
                        {
                          field.options?.map((option: string, index: number) => (
                            <option key={index} value={option}>{option}</option>
                          ))
                        }
                      </select>

                      <ChevronDownIcon className="absolute top-3 right-2 w-4 h-4 text-gray-500" />
                    </div>
                  ) : (
                    <textarea
                      name={field.name}
                      value={field.value || ""}
                      className="focus:outline-none block w-full sm:text-sm border-gray-300 text-vulcan-500"
                      onChange={(e) => onTextChange(field, e.currentTarget.value)}
                    />
                  )
                }
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default React.forwardRef(SnippetForm);