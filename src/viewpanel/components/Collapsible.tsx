import * as React from 'react';
import { VsCollapsible } from './VscodeComponents';

export interface ICollapsibleProps {
  title: string;
  className?: string;
  sendUpdate?: (open: boolean) => void;
}

export const Collapsible: React.FunctionComponent<ICollapsibleProps> = ({children, title, sendUpdate, className}: React.PropsWithChildren<ICollapsibleProps>) => {
  const [ isOpen, setIsOpen ] = React.useState(true);

  // This is a work around for a lit-element issue of duplicate slot names
  const triggerClick = (e: React.MouseEvent<HTMLElement>) => {
    if ((e.target as any).tagName.toUpperCase() === 'VSCODE-COLLAPSIBLE') {
      setIsOpen(prev => {
        if (sendUpdate) {
          sendUpdate(!prev);
        }
        return !prev;
      }); 
    }
  }

  return (
    <VsCollapsible title={title} onClick={triggerClick} open={isOpen}>
      <div className={`section collapsible__body ${className || ""}`} slot="body">
        {children}
      </div>
    </VsCollapsible>
  );
};