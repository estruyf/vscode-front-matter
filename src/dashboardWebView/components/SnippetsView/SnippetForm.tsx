import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { SnippetVariables } from '../../../constants';
import { Choice, SnippetParser, Variable, VariableResolver } from '../../../helpers/SnippetParser';
import { SnippetField } from '../../../models';
import { DashboardMessage } from '../../DashboardMessage';
import { ViewDataSelector } from '../../state';
import { SnippetInputField } from './SnippetInputField';


export interface ISnippetFormProps {
  snippet: any;
  selection: string | undefined;
}

export interface SnippetFormHandle {
  onSave: () => void;
}

const SnippetForm: React.ForwardRefRenderFunction<SnippetFormHandle, ISnippetFormProps> = ({ snippet, selection }, ref) => {
  const viewData = useRecoilValue(ViewDataSelector);
  const [ fields, setFields ] = useState<SnippetField[]>([]);

  const onTextChange = useCallback((field: SnippetField, value: string) => {
    setFields(prevFields => prevFields.map(f => f.name === field.name ? { ...f, value } : f));
  }, [setFields]);

  const insertSelectionValue = useCallback((value: string) => {
    if (selection && value === SnippetVariables.FM_SELECTED_TEXT) {
      return selection;
    }

    return;
  }, [selection]);

  const snippetBody = useMemo(() => {
    let body = typeof snippet.body === "string" ? snippet.body : snippet.body.join(`\n`);

    for (const field of fields) {
      body = body.replace(field.tmString, field.value);
    }

    return body;
  }, [fields, selection]);

  const shouldShowField = (fieldName: string, idx: number, allFields: SnippetField[]) => {
    const crntField = allFields.findIndex(f => f.name === fieldName);
    if (crntField < idx) {
      return false;
    }
    return true;
  }

  const fieldNameRender = (fieldName: string) => {
    if (fieldName === SnippetVariables.FM_SELECTED_TEXT) {
      return 'Selected Text';
    }

    if (fieldName.startsWith(SnippetVariables.FM_TEXT)) {
      return fieldName.replace(SnippetVariables.FM_TEXT, '');
    }

    if (fieldName.startsWith(SnippetVariables.FM_MULTILINE)) {
      return fieldName.replace(SnippetVariables.FM_MULTILINE, '');
    }

    return fieldName;
  }

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
    // Defines the type of field that needs to be rendered
    const getFieldType = (fieldName: string) => {
      if (fieldName.startsWith(SnippetVariables.FM_MULTILINE)) {
        return 'textarea';
      }

      return 'text';
    }

    // Get all placeholder variables from the snippet
    const snippetParser = new SnippetParser();
    const body = typeof snippet.body === "string" ? snippet.body : snippet.body.join(`\n`);

    const parsed = snippetParser.parse(body);
    const placeholders = parsed.placeholderInfo.all;

    const allFields: any[] = [];

    for (const placeholder of placeholders) {
      const tmString = placeholder.toTextmateString();

      // If only a variable is defined, it will not contain children
      if (placeholder.children.length === 0) {
        allFields.push({
          type: getFieldType(placeholder.index as string),
          name: placeholder.index,
          value: insertSelectionValue(placeholder.index as string) || '',
          tmString
        });
      } else {
        // Children are defined, so it means it is a choice field or the variable has a default value
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
              type: getFieldType(placeholder.index as string),
              name: placeholder.index,
              value: insertSelectionValue((child as any).value as string) || insertSelectionValue(placeholder.index as string) || (child as any).value || "",
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
          fields.map((field: SnippetField, index: number, allFields: SnippetField[]) => (
            shouldShowField(field.name, index, allFields) && (
              <div key={index}>
                <label htmlFor={field.name} className="block text-sm font-medium capitalize">
                  {fieldNameRender(field.name)}
                </label>
                <div className="mt-1">
                  <SnippetInputField
                    field={field}
                    onValueChange={onTextChange} />
                </div>
              </div>
            )
          ))
        }
      </div>
    </div>
  );
};

export default React.forwardRef(SnippetForm);