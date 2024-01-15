import * as React from 'react';
import { HandThumbDownIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { HandThumbDownIcon as ThumbDownSolidIcon, HandThumbUpIcon as ThumbUpSolidIcon } from '@heroicons/react/24/solid';
import { useCallback } from 'react';
import { useSettingsContext } from '../../providers/SettingsProvider';

export interface IFeedbackProps {
  answerId: number;
}

export const Feedback: React.FunctionComponent<IFeedbackProps> = ({
  answerId
}: React.PropsWithChildren<IFeedbackProps>) => {
  const { aiUrl } = useSettingsContext();
  const [isUpVoted, setIsUpVoted] = React.useState<boolean>(false);
  const [isDownVoted, setIsDownVoted] = React.useState<boolean>(false);

  const onUpVote = useCallback(() => {
    setIsUpVoted(true)
    setIsDownVoted(false)
    callVote(true)
  }, []);

  const onDownVote = useCallback(() => {
    setIsDownVoted(true)
    setIsUpVoted(false)
    callVote(false)
  }, []);

  const callVote = useCallback(async (vote: boolean) => {
    await fetch(`${aiUrl}/api/ai-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answerId,
        vote: vote ? 1 : -1,
      })
    })
  }, [answerId])

  if (!answerId) {
    return null;
  }

  return (
    <div className='text-lg flex gap-4'>
      <button
        className='hover:text-[var(--vscode-textLink-activeForeground)]'
        onClick={onUpVote}>
        {
          isUpVoted ? (
            <ThumbUpSolidIcon className='h-4 w-4 text-[var(--vscode-textLink-foreground)]' />
          ) : (
            <HandThumbUpIcon className='h-4 w-4' />
          )
        }
      </button>
      <button
        className='hover:text-[var(--vscode-textLink-activeForeground)]'
        onClick={() => onDownVote()}>
        {
          isDownVoted ? (
            <ThumbDownSolidIcon className='h-4 w-4 text-[var(--vscode-textLink-foreground)]' />
          ) : (
            <HandThumbDownIcon className='h-4 w-4' />
          )
        }
      </button>
    </div>
  );
};