import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { Choice, Scanner, SnippetParser, TokenType, Variable, VariableResolver } from '../../../helpers/SnippetParser';
import { DashboardMessage } from '../../DashboardMessage';
import { ViewDataSelector } from '../../state';

export interface IItemProps {
  snippet: any;
}

export const Item: React.FunctionComponent<IItemProps> = ({ snippet }: React.PropsWithChildren<IItemProps>) => {
  const viewData = useRecoilValue(ViewDataSelector);

  // Todo: On add, show dialog to insert the placeholders and content

  const insertToArticle = () => {
    Messenger.send(DashboardMessage.insertSnippet, {
      file: viewData?.data?.filePath,
      snippet: snippet.body.join(`\n`)
    });
  };

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
            <button onClick={insertToArticle}>Add</button>
          ) : (
            <div>Edit</div>
          )
        }
      </div>
    </li>
  );
};