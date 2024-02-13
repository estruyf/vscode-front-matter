import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { SnippetParser } from '../../../helpers/SnippetParser';
import { Snippet, SnippetField, SnippetInfoField, SnippetSpecialPlaceholders } from '../../../models';
import { DashboardMessage } from '../../DashboardMessage';
import { SettingsAtom, ViewDataSelector } from '../../state';
import { SnippetInputField } from './SnippetInputField';
import { SNIPPET } from '../../../constants/Snippet';

export interface ISnippetFormProps {
  snippetKey?: string;
  snippet: Snippet;
  selection: string | undefined;
  filePath?: string;
  fieldInfo?: SnippetInfoField[];
  mediaData?: any;
  onInsert?: (mediaData: any) => void;
}

export interface SnippetFormHandle {
  onSave: () => void;
}

const SnippetForm: React.ForwardRefRenderFunction<SnippetFormHandle, ISnippetFormProps> = (
  { snippetKey, snippet, selection, filePath, fieldInfo, mediaData, onInsert },
  ref
) => {
  const viewData = useRecoilValue(ViewDataSelector);
  const [fields, setFields] = useState<SnippetField[]>([]);
  const settings = useRecoilValue(SettingsAtom);

  const onTextChange = useCallback(
    (field: SnippetField, value: string) => {
      setFields((prevFields) =>
        prevFields.map((f) => (f.name === field.name ? { ...f, value } : f))
      );
    },
    [setFields]
  );

  const insertPlaceholderValues = useCallback(
    async (value: SnippetSpecialPlaceholders) => {
      if (value === 'FM_SELECTED_TEXT') {
        return selection || '';
      }

      value = await messageHandler.request<string>(DashboardMessage.updateSnippetPlaceholders, {
        value,
        filePath
      });

      return value;
    },
    [selection, filePath]
  );

  const insertValueFromMedia = useCallback(
    (fieldName: string) => {
      if (!mediaData) {
        return '';
      }

      if (mediaData[fieldName]) {
        return mediaData[fieldName];
      }

      if (mediaData.metadata && mediaData.metadata[fieldName]) {
        return mediaData.metadata[fieldName];
      }
    },
    [mediaData]
  );

  const snippetBody = useMemo(() => {
    let body = typeof snippet.body === 'string' ? snippet.body : snippet.body.join(`\n`);

    const obj: any = {};
    for (const field of fields) {
      obj[field.name] = field.value;
    }

    return SnippetParser.render(body, obj, snippet.openingTags, snippet.closingTags);
  }, [fields, snippet]);

  const shouldShowField = (fieldName: string, idx: number, allFields: SnippetField[]) => {
    const crntField = allFields.findIndex((f) => f.name === fieldName);
    if (crntField < idx) {
      return false;
    }
    return true;
  };

  useImperativeHandle(ref, () => ({
    onSave() {
      if (!snippetBody) {
        return;
      }

      const snippetInfo = {
        id: snippetKey,
        fields: fields.map(f => ({
          name: f.name,
          value: f.value
        }))
      }

      if (!onInsert) {
        if (!snippetKey || settings?.snippetsWrapper === false) {
          Messenger.send(DashboardMessage.insertSnippet, {
            file: viewData?.data?.filePath,
            snippet: snippetBody
          });
        } else {
          Messenger.send(DashboardMessage.insertSnippet, {
            file: viewData?.data?.filePath,
            range: viewData?.data?.range,
            snippet: `<!-- ${SNIPPET.wrapper.start} data:${JSON.stringify(snippetInfo)} -->
${snippetBody}
<!-- ${SNIPPET.wrapper.end} -->`
          });
        }
      } else {
        onInsert(snippetBody);
      }
    }
  }));

  const processFields = useCallback(async () => {
    // Get all placeholder variables from the snippet
    const body = typeof snippet.body === 'string' ? snippet.body : snippet.body.join(`\n`);

    const placeholders = SnippetParser.getPlaceholders(
      body,
      snippet.openingTags,
      snippet.closingTags
    );

    const allFields: SnippetField[] = [];
    const snippetFields = snippet.fields || [];

    // Loop over all fields to check if they are present in the snippet
    for (const field of snippetFields) {
      const idx = placeholders.findIndex((fieldName) => fieldName === field.name);
      if (idx > -1) {
        allFields.push({
          ...field,
          value: await insertPlaceholderValues(field.default || '')
        });
      }
    }

    // Loop over all placeholders to find the ones that are not present in the snippet fields
    for (const fieldName of placeholders) {
      const idx = snippetFields.findIndex((field) => field.name === fieldName);
      if (idx === -1) {
        allFields.push({
          name: fieldName,
          title: fieldName,
          type: 'string',
          single: true,
          value: insertValueFromMedia(fieldName)
        });
      }
    }

    setFields(allFields);
  }, [snippet, insertPlaceholderValues, insertValueFromMedia]);

  useEffect(() => {
    processFields();
  }, [snippet]);

  return (
    <div>
      <pre className={`border p-2 whitespace-pre-wrap break-words max-h-64 overflow-auto rounded border-[var(--frontmatter-border)] bg-[var(--vscode-editor-background)] text-[var(--vscode-editor-foreground)]`}>
        {snippetBody}
      </pre>

      <div className="space-y-4 mt-4">
        {fields.map(
          (field: SnippetField, index: number, allFields: SnippetField[]) =>
            shouldShowField(field.name, index, allFields) && (
              <div key={index}>
                <label htmlFor={field.name} className="block text-sm font-medium capitalize">
                  {field.title || field.name}
                </label>
                <div className="mt-1">
                  <SnippetInputField field={field} fieldInfo={fieldInfo} onValueChange={onTextChange} />
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default React.forwardRef(SnippetForm);
