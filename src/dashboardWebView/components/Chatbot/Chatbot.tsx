import * as React from 'react';
import { InitResponse } from './models/InitResponse';
import { NewConversationResponse } from './models/NewConversationResponse';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { ChatIcon, PaperAirplaneIcon, ThumbDownIcon, ThumbUpIcon } from '@heroicons/react/outline';
import { ThumbDownIcon as ThumbDownSolidIcon, ThumbUpIcon as ThumbUpSolidIcon } from '@heroicons/react/solid';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useCallback, useEffect } from 'react';

export interface IChatbotProps { }

export const Chatbot: React.FunctionComponent<IChatbotProps> = (props: React.PropsWithChildren<IChatbotProps>) => {
  const [company, setCompany] = React.useState<string | undefined>(undefined);
  const [chatId, setChatId] = React.useState<number | undefined>(undefined);
  const [message, setMessage] = React.useState<string>("");
  const [questions, setQuestions] = React.useState<string[]>([]);
  const [answers, setAnswers] = React.useState<string[]>([]);
  const [answerIds, setAnswerIds] = React.useState<number[]>([]);
  const [sources, setSources] = React.useState<string[][]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [upVote, setUpVotes] = React.useState<number[]>([]);
  const [downVote, setDownvotes] = React.useState<number[]>([]);

  const init = async () => {
    setLoading(true);
    const initResponse = await fetch('https://aijsplayground-production.up.railway.app/initializeMendable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        anon_key: "466f5321-12d9-4d64-9e5b-ea5db41ed2ba"
      })
    });

    if (!initResponse.ok) {
      return;
    }

    const initJson: InitResponse = await initResponse.json();

    const newChatResponse = await fetch('https://aijsplayground-production.up.railway.app/newConversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        anon_key: "466f5321-12d9-4d64-9e5b-ea5db41ed2ba",
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

  const onUpVote = useCallback(async (index: number) => {
    setUpVotes(prev => [...prev, index])
    setDownvotes(prev => prev.filter(i => i !== index))
    callVote(index, true)
  }, []);

  const onDownVote = useCallback(async (index: number) => {
    setDownvotes(prev => [...prev, index])
    setUpVotes(prev => prev.filter(i => i !== index))
    callVote(index, false)
  }, []);

  const callVote = async (index: number, vote: boolean) => {
    await fetch(`https://aijsplayground-production.up.railway.app/updateMessageRating/${index}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ratingValue: vote ? 1 : -1,
      })
    })
  }

  const callChatbot = useCallback(async () => {
    const nrOfQuestions = questions.length + 1;
    setLoading(true);

    setQuestions(prev => [...prev, message])
    setAnswers(prev => [...prev, ""])
    setSources(prev => [...prev, []])
    setAnswerIds(prev => [...prev, 0])

    setTimeout(() => {
      setMessage("")
    }, 0);

    if (!company || !chatId) {
      return;
    }

    await fetchEventSource('https://aijsplayground-production.up.railway.app/qaChat', {
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
  }, [company, chatId, message, questions]);

  useEffect(() => {
    init();
  }, []);

  return (
    <div className={`flex flex-col overflow-x-hidden h-full w-full items-center overflow-hidden`}>
      <header className={`w-full max-w-xl m-4`}>
        <h1 className='text-2xl flex items-center space-x-4'>
          <ChatIcon className='h-6 w-6' />
          <span>Ask Font Matter AI</span>
        </h1>
        <h2
          className='mt-2 text-sm text-[var(--frontmatter-secondary-text)]'
          style={{
            fontFamily: "var(--vscode-editor-font-family)",
          }}
        >
          Our AI, powered by <a className={`text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground)]`} href={`https://www.mendable.ai/`} title={`mendable.ai`}>mendable.ai</a>, has processed the documentation and can assist you with any queries regarding Front Matter. Go ahead and ask away!
        </h2>
      </header>

      <div className='w-full h-[1px] bg-[var(--frontmatter-border)] mb-4'></div>

      <main className={`qa__bot flex-grow w-full max-w-xl overflow-y-auto overflow-x-hidden`}>
        <div>
          {
            questions.map((question, idx) => (
              <ul key={`question-${idx}`} className={`space-y-4`}>
                <li className='question'>{question}</li>
                {answers.length > 0 && answers[idx] && (
                  <li className='answer'>
                    <div className='text-lg flex justify-between'>
                      <p>Answer</p>

                      {
                        answerIds[idx] && (
                          <div className='text-lg flex gap-4'>
                            <button
                              className='hover:text-[var(--vscode-textLink-activeForeground)]'
                              onClick={() => onUpVote(answerIds[idx])}>
                              {
                                upVote.includes(answerIds[idx]) ? (
                                  <ThumbUpSolidIcon className='h-4 w-4 text-[var(--vscode-textLink-foreground)]' />
                                ) : (
                                  <ThumbUpIcon className='h-4 w-4' />
                                )
                              }
                            </button>
                            <button
                              className='hover:text-[var(--vscode-textLink-activeForeground)]'
                              onClick={() => onDownVote(answerIds[idx])}>
                              {
                                downVote.includes(answerIds[idx]) ? (
                                  <ThumbDownSolidIcon className='h-4 w-4 text-[var(--vscode-textLink-foreground)]' />
                                ) : (
                                  <ThumbDownIcon className='h-4 w-4' />
                                )
                              }
                            </button>
                          </div>
                        )
                      }
                    </div>

                    <ReactMarkdown children={answers[idx]} remarkPlugins={[remarkGfm]} />

                    {
                      sources[idx].length > 0 && sources[idx] && (
                        <div>
                          <p className='text-lg'>Resources</p>
                          <ul className={`space-y-2 list-disc pl-4`}>
                            {sources[idx].map((source, idx) => (
                              <li key={`source-${idx}`} className={`text-sm`}>
                                <a className={`text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground)]`} href={source} target="_blank" rel="noreferrer">{source}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    }

                    <div className={`-mx-4 -mb-4 py-2 px-4 bg-[var(--vscode-sideBar-background)] text-[var(--vscode-sideBarTitle-foreground)] rounded-b`} style={{
                      fontFamily: "var(--vscode-editor-font-family)",
                    }}>
                      Warning: Anwers might be wrong. In case of doubt, please consult the docs.
                    </div>
                  </li>
                )}
              </ul>
            ))
          }
        </div>

        {
          loading && (
            <div>
              <div className="mt-4 flex items-center justify-center space-x-2 animate-pulse">
                <div className="w-4 h-4 bg-[var(--frontmatter-button-background)] rounded-full"></div>
                <div className="w-4 h-4 bg-[var(--frontmatter-button-background)] rounded-full"></div>
                <div className="w-4 h-4 bg-[var(--frontmatter-button-background)] rounded-full"></div>
              </div>
            </div>
          )
        }
      </main>

      <footer className={`w-full max-w-xl relative my-4`}>
        <textarea
          className={`resize-none w-full outline-none border-0`}
          placeholder='How should I configure Front Matter?'
          autoFocus={true}
          value={message}
          cols={30}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              callChatbot();
            }
          }}
        />

        <button
          className={`absolute right-3 top-3 text-[var(--frontmatter-button-background)] hover:text-[var(--frontmatter-button-hoverBackground)] disabled:opacity-50 disabled:text-[var(--vscode-disabledForeground)]`}
          type='button'
          disabled={message.trim().length === 0 || loading}
          onClick={callChatbot}
        >
          <PaperAirplaneIcon className='h-6 w-6 rotate-90' />
        </button>
      </footer>
    </div>
  );
};