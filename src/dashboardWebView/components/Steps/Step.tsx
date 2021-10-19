import { CheckIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { Status } from '../../models/Status';

export interface IStepProps {
  name: string;
  description: JSX.Element;
  status: Status;
  showLine: boolean;
  onClick?: () => void | undefined;
}

export const Step: React.FunctionComponent<IStepProps> = ({name, description, status, showLine, onClick}: React.PropsWithChildren<IStepProps>) => {

  const renderChildren = () => {
    return (
      <>
        {
          status === Status.NotStarted && (
            <span className="h-9 flex items-center" aria-hidden="true">
              <span className={`relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full ${onClick ? "group-hover:text-gray-400" : ""}`}>
                <span className={`h-2.5 w-2.5 bg-transparent rounded-full ${onClick ? "group-hover:bg-gray-300" : ""}`} />
              </span>
            </span>
          )
        }

        {
          status === Status.Active && (
            <span className="h-9 flex items-center" aria-hidden="true">
              <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-teal-600 rounded-full">
                <span className="h-2.5 w-2.5 bg-teal-600 rounded-full" />
              </span>
            </span>
          )
        }

        {
          status === Status.Completed && (
            <span className="h-9 flex items-center">
              <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-teal-600 rounded-full group-hover:bg-teal-800">
                <CheckIcon className="w-5 h-5 text-white" aria-hidden="true" />
              </span>
            </span>
          )
        }

        <span className="ml-4 min-w-0 flex flex-col">
          <span className="text-xs font-semibold tracking-wide uppercase text-vulcan-500 dark:text-whisper-500">{name}</span>
          <div className="text-sm text-vulcan-400 dark:text-whisper-600">{description}</div>
        </span>
      </>
    );
  };

  return (
    <>
      {
        showLine ? (
          <div className={`-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full ${status === Status.Completed ? "bg-teal-600" : "bg-gray-300"}`} aria-hidden="true" />
        ) : null
      }

      {
        onClick ? (
          <button className={`relative flex items-start group text-left`} onClick={() => { if (onClick) { onClick(); } }} disabled={!onClick}>
            {renderChildren()}
          </button>
        ) : (
          <div className="relative flex items-start group text-left">
            {renderChildren()}
          </div>
        )
      }
    </>
  );
};