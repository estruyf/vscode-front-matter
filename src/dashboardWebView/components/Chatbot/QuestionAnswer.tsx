import * as React from 'react';
import { Answer } from './Answer';

export interface IQuestionAnswerProps {
  question: string;
  answer: string;
  answerId: number;
  sources: string[];
}

export const QuestionAnswer: React.FunctionComponent<IQuestionAnswerProps> = ({ question, answer, answerId, sources }: React.PropsWithChildren<IQuestionAnswerProps>) => {
  return (
    <ul className={`mt-4 space-y-4 px-4`}>
      <li className='question'>{question}</li>

      <Answer
        answer={answer}
        answerId={answerId}
        sources={sources} />
    </ul>
  );
};