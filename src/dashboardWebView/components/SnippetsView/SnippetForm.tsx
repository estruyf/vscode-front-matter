import * as React from 'react';
import { useEffect, useState } from 'react';
import { Choice, SnippetParser, Variable, VariableResolver } from '../../../helpers/SnippetParser';

export interface ISnippetFormProps {
  snippet: any;
}

export const SnippetForm: React.FunctionComponent<ISnippetFormProps> = ({ snippet }: React.PropsWithChildren<ISnippetFormProps>) => {
  const [ fields, setFields ] = useState<any>([]);

  useEffect(() => {
    const snippetParser = new SnippetParser();
    const body = snippet.body.join(`\n`);

    const parsed = snippetParser.parse(body);
    const placeholders = parsed.placeholderInfo.all;

    const allFields: any[] = [];

    for (const placeholder of placeholders) {
      const tmString = placeholder.toTextmateString();
      console.log(`tmString`, placeholder);

      if (placeholder.children.length === 0) {
        allFields.push({
          type: 'text',
          name: placeholder.index,
          value: '',
          tmString
        });
      } else {
        for (const child of placeholder.children as any[]) {
          if (child instanceof Choice) {
            allFields.push({
              type: 'select',
              name: placeholder.index,
              value: (child as any).value,
              options: child.options,
              tmString
            });
          } else {
            allFields.push({
              type: 'text',
              name: placeholder.index,
              value: (child as any).value,
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
      <pre className='border border-opacity-40 p-2 whitespace-normal break-words'>{snippet.body.join(`\n`)}</pre>

      <ul className='mt-4'>
        {
          fields.map((field: any, index: number) => (
            <li key={index}>
              <p>{field.name} - {field.value} - {(field.options || []).join(',')}</p>
            </li>
          ))
        }
      </ul>
    </div>
  );
};