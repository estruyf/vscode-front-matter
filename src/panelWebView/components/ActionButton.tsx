import * as React from 'react';

export interface IActionButtonProps {
  title: string;
  className?: string;
  disabled?: boolean;
  onClick: (e: React.SyntheticEvent<HTMLButtonElement>) => void;
}

const ActionButton: React.FunctionComponent<IActionButtonProps> = ({className, onClick, disabled,title}: React.PropsWithChildren<IActionButtonProps>) => {
  return (
    <div className={`article__action`}>
      <button onClick={onClick} className={className || ""} disabled={disabled}>{title}</button>
    </div>
  );
};

ActionButton.displayName = 'ActionButton';
export { ActionButton };