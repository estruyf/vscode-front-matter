import * as React from 'react';
import { InitResponse } from './models/InitResponse';
import { NewConversationResponse } from './models/NewConversationResponse';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useCallback, useEffect } from 'react';
import { Header } from './Header';
import { Chatbox } from './Chatbox';
import { Loader } from './Loader';
import { QuestionAnswer } from './QuestionAnswer';
import { Placeholder } from './Placeholder';
import { useSettingsContext } from '../../providers/SettingsProvider';

export interface IChatbotProps { }

export const Chatbot: React.FunctionComponent<IChatbotProps> = ({ }: React.PropsWithChildren<IChatbotProps>) => {
  const { aiKey, aiUrl } = useSettingsContext();
  const [company, setCompany] = React.useState<string | undefined>(undefined);
  const [chatId, setChatId] = React.useState<number | undefined>(undefined);
  const [questions, setQuestions] = React.useState<string[]>([]);
  const [answers, setAnswers] = React.useState<string[]>([]);
  const [answerIds, setAnswerIds] = React.useState<number[]>([]);
  const [sources, setSources] = React.useState<string[][]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const init = async () => {
    setLoading(true);
    const initResponse = await fetch(`${aiUrl}/initializeMendable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        anon_key: aiKey
      })
    });

    if (!initResponse.ok) {
      return;
    }

    const initJson: InitResponse = await initResponse.json();

    const newChatResponse = await fetch(`${aiUrl}/newConversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        anon_key: aiKey,
        messages: []
      })
    })

    if (!newChatResponse.ok) {
      return;
    }

    const newChat: NewConversationResponse = await newChatResponse.json();

    setCompany(initJson.company.name);
    setChatId(newChat.conversation_id);
    setLoading(false);
  };

  const callChatbot = useCallback(async (message) => {
    const nrOfQuestions = questions.length + 1;
    setLoading(true);

    setQuestions(prev => [...prev, message])
    setAnswers(prev => [...prev, ""])
    setSources(prev => [...prev, []])
    setAnswerIds(prev => [...prev, 0])

    if (!company || !chatId) {
      return;
    }

    await fetchEventSource(`${aiUrl}/qaChat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        company: company,
        conversation_id: chatId,
        history: [{ prompt: "", response: "", sources: [] }],
        question: message,
      }),
      onmessage: (event) => {
        setLoading(false);
        const data = JSON.parse(event.data);
        const chunk = data.chunk;

        if (chunk === "<|source|>") {
          setSources(prev => {
            const metadata = [...new Set(data.metadata.map((m: any) => m.link))] as string[]

            const crntSources: string[][] = Object.assign([], prev)
            if (crntSources.length === nrOfQuestions) {
              crntSources[nrOfQuestions - 1] = metadata;
            } else {
              crntSources.push(metadata);
            }

            return crntSources;
          });
        } else if (chunk === "<|message_id|>" && data.metadata) {
          setAnswerIds(prev => {
            const crntAnswerIds: number[] = Object.assign([], prev)
            if (crntAnswerIds.length === nrOfQuestions) {
              crntAnswerIds[nrOfQuestions - 1] = data.metadata;
            } else {
              crntAnswerIds.push(data.metadata);
            }

            return crntAnswerIds;
          });
        } else {
          setAnswers(prev => {
            const crntAnswers: string[] = Object.assign([], prev)
            if (crntAnswers.length === nrOfQuestions) {
              crntAnswers[nrOfQuestions - 1] = crntAnswers[nrOfQuestions - 1] + chunk;
            } else {
              crntAnswers.push(chunk);
            }

            return crntAnswers;
          });
        }
      }
    });
  }, [company, chatId, questions]);

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

      <Chatbox isLoading={loading} onTrigger={callChatbot} />

      <img className='hidden' src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Ffrontmatter.codes%2Fmetrics%2Fdashboards&slug=chatbot" alt="Chatbot metrics" />
    </div>
  );
};