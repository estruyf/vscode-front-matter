import * as React from 'react';

export interface IOtherActionButtonProps {
  className?: string;
  disabled?: boolean;
  onClick: (e: React.SyntheticEvent<HTMLButtonElement>) => void;
}

export const OtherActionButton: React.FunctionComponent<IOtherActionButtonProps> = ({ className, disabled, onClick, children}: React.PropsWithChildren<IOtherActionButtonProps>) => {
  return (
    <div className={`ext_link_block`}>
      <button onClick={onClick} className={className || ""} disabled={disabled}>{children}</button>
    </div>
  );
};