import * as React from 'react';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { Choice, Scanner, SnippetParser, TokenType, Variable, VariableResolver } from '../../../helpers/SnippetParser';
import { ViewDataSelector } from '../../state';

export interface IItemProps {
  snippet: any;
}

export const Item: React.FunctionComponent<IItemProps> = ({ snippet }: React.PropsWithChildren<IItemProps>) => {
  const viewData = useRecoilValue(ViewDataSelector);

  // Todo: On add, show dialog to insert the placeholders and content

  useEffect(() => {
    const snippetParser = new SnippetParser();
    const body = snippet.body.join(`\n`);

    const parsed = snippetParser.parse(body);
    const placeholders = parsed.placeholderInfo.all;

    for (const placeholder of placeholders) {
      const tmString = placeholder.toTextmateString();

      for (const child of placeholder.children as any[]) {
        if (child instanceof Choice) {
          console.log(child.options)
        } else {
          console.log(tmString, child.value);
        }
      }
    }

    const resolver: VariableResolver = { 
      resolve: (variable: Variable): string | undefined => {
        console.log(`variable`, variable);
        return undefined;
      }
    };
    
    parsed.resolveVariables(resolver);
  }, []);
  
  return (
    <li className="group relative bg-gray-50 dark:bg-vulcan-200 shadow-md hover:shadow-xl dark:shadow-none dark:hover:bg-vulcan-100 border border-gray-100 dark:border-vulcan-50 p-4">
      <div className="font-bold text-xl mb-2">{snippet.title}</div>
      <p className="text-whisper-900 text-base">{snippet.description}</p>
      <div>
        {
          viewData?.data?.filePath ? (
            <div>Add</div>
          ) : (
            <div>Edit</div>
          )
        }
      </div>
    </li>
  );
};