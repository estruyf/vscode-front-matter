import * as React from 'react';

export interface IActionButtonProps {
  title: string;
  className?: string;
  disabled?: boolean;
  onClick: (e: React.SyntheticEvent<HTMLButtonElement>) => void;
}

const ActionButton: React.FunctionComponent<IActionButtonProps> = ({
  className,
  onClick,
  disabled,
  title,
  children
}: React.PropsWithChildren<IActionButtonProps>) => {
  return (
    <div className={`article__action w-full`}>
      <button type="button" title={title} onClick={onClick} className={className || ''} disabled={disabled}>
        {children}
      </button>
    </div>
  );
};

ActionButton.displayName = 'ActionButton';
export { ActionButton };
