import { XIcon } from '@heroicons/react/outline';
import * as React from 'react';

export interface IChoiceButtonProps {
  title: string;
  value: string;
  onClick: (value: string) => void;
}

export const ChoiceButton: React.FunctionComponent<IChoiceButtonProps> = ({title, value, onClick}: React.PropsWithChildren<IChoiceButtonProps>) => {
  return (
    <button 
      title={`Remove ${title}`} 
      className="metadata_field__choice__button"
      onClick={() => onClick(value)}>
        {title}
        <XIcon className={`metadata_field__choice__button_icon`} />
    </button>
  );
};