import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { Header } from './Header';
import { Chatbox } from './Chatbox';
import { Loader } from './Loader';
import { QuestionAnswer } from './QuestionAnswer';
import { Placeholder } from './Placeholder';
import { useSettingsContext } from '../../providers/SettingsProvider';
import { AiInitResponse } from './models/AiInitResponse';

export interface IChatbotProps { }

export const Chatbot: React.FunctionComponent<IChatbotProps> = ({ }: React.PropsWithChildren<IChatbotProps>) => {
  const { aiUrl } = useSettingsContext();
  const [company, setCompany] = React.useState<string | undefined>(undefined);
  const [chatId, setChatId] = React.useState<number | undefined>(undefined);
  const [questions, setQuestions] = React.useState<string[]>([]);
  const [answers, setAnswers] = React.useState<string[]>([]);
  const [answerIds, setAnswerIds] = React.useState<number[]>([]);
  const [sources, setSources] = React.useState<string[][]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const init = async () => {
    setLoading(true);
    const initResponse = await fetch(`${aiUrl}/api/ai-init`);

    if (!initResponse.ok) {
      return;
    }

    const initJson: AiInitResponse = await initResponse.json();

    if (!initJson.company || !initJson.chatId) {
      return;
    }

    setCompany(initJson.company);
    setChatId(initJson.chatId);
    setLoading(false);
  };

  const onTrigger = useCallback(async (message: string) => {
    callChatbot(message, questions.length);
  }, [questions, company, chatId]);

  const callChatbot = useCallback(async (message, questionLenght) => {
    const nrOfQuestions = questionLenght + 1;
    setLoading(true);

    setQuestions(prev => [...prev, message])
    setAnswers(prev => [...prev, ""])
    setSources(prev => [...prev, []])
    setAnswerIds(prev => [...prev, 0])

    if (!company || !chatId) {
      return;
    }

    const response = await fetch(`${aiUrl}/api/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*',
      },
      body: JSON.stringify({
        company,
        chatId,
        question: message,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      return;
    }

    const data: {
      answer: string;
      answerId: number;
      sources: string[];
    } = await response.json();

    if (!data.answer || !data.answerId) {
      return;
    }

    setSources(prev => {
      const metadata = [...new Set(data.sources || [])] as string[]
      const crntSources: string[][] = Object.assign([], prev)
      if (crntSources.length === nrOfQuestions) {
        crntSources[nrOfQuestions - 1] = metadata;
      } else {
        crntSources.push(metadata);
      }

      return crntSources;
    });

    setAnswerIds(prev => {
      const crntAnswerIds: number[] = Object.assign([], prev)
      if (crntAnswerIds.length === nrOfQuestions) {
        crntAnswerIds[nrOfQuestions - 1] = data.answerId;
      } else {
        crntAnswerIds.push(data.answerId);
      }

      return crntAnswerIds;
    });

    setAnswers(prev => {
      const crntAnswers: string[] = Object.assign([], prev)
      if (crntAnswers.length === nrOfQuestions) {
        crntAnswers[nrOfQuestions - 1] = data.answer;
      } else {
        crntAnswers.push(data.answer);
      }

      return crntAnswers;
    });
  }, [company, chatId]);

  useEffect(() => {
    init();
  }, []);

  return (
    <div className={`flex flex-col overflow-x-hidden h-full w-full items-center overflow-hidden`}>
      <Header />

      <div className='w-full h-[1px] bg-[var(--frontmatter-border)] -mx-4 mb-4'></div>

      <main className={`qa__bot flex-grow w-full max-w-xl overflow-y-auto overflow-x-hidden`}>
        {
          questions && questions.length > 0 ? questions.map((question, idx) => (
            <QuestionAnswer
              key={idx}
              question={question}
              answer={answers[idx]}
              answerId={answerIds[idx]}
              sources={sources[idx]} />
          )) : (
            <Placeholder />
          )
        }

        {
          loading && (questions && questions.length > 0) && <Loader />
        }
      </main>

      <Chatbox isLoading={loading} onTrigger={onTrigger} />

      <img className='hidden' src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Ffrontmatter.codes%2Fmetrics%2Fdashboards&slug=chatbot" alt="Chatbot metrics" />
    </div>
  );
};