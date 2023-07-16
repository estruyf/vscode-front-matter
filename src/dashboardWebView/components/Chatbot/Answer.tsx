import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Feedback } from './Feedback';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IAnswerProps {
  answer: string;
  answerId: number;
  sources: string[];
}

export const Answer: React.FunctionComponent<IAnswerProps> = ({
  answer,
  answerId,
  sources,
}: React.PropsWithChildren<IAnswerProps>) => {
  if (!answer) {
    return null;
  }

  return (
    <li className='answer'>
      <div className='text-lg flex justify-between'>
        <p>{l10n.t(LocalizationKey.dashboardChatbotAnswerAnswer)}</p>

        <Feedback answerId={answerId} />
      </div>

      <ReactMarkdown children={answer} remarkPlugins={[remarkGfm]} />

      {
        sources && sources.length > 0 && (
          <div>
            <p className='text-lg'>{l10n.t(LocalizationKey.dashboardChatbotAnswerResources)}</p>
            <ul className={`space-y-2 list-disc pl-4`}>
              {sources.map((source, idx) => (
                <li key={`source-${idx}`} className={`text-sm`}>
                  <a className={`text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground)]`} href={source} target="_blank" rel="noreferrer">{source}</a>
                </li>
              ))}
            </ul>
          </div>
        )
      }

      <div className={`-mx-4 -mb-4 py-2 px-4 bg-[var(--vscode-sideBar-background)] text-[var(--vscode-sideBarTitle-foreground)] text-xs rounded-b`} style={{
        fontFamily: "var(--vscode-editor-font-family)",
      }}>
        {l10n.t(LocalizationKey.dashboardChatbotAnswerWarning)}
      </div>
    </li>
  );
};