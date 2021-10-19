import * as React from 'react';
import { useEffect } from 'react';
import { Command } from '../Command';
import { VsCollapsible } from './VscodeComponents';

export interface ICollapsibleProps {
  id: string;
  title: string;
  className?: string;
  sendUpdate?: (open: boolean) => void;
}

const Collapsible: React.FunctionComponent<ICollapsibleProps> = ({id, children, title, sendUpdate, className}: React.PropsWithChildren<ICollapsibleProps>) => {
  const [ isOpen, setIsOpen ] = React.useState(false);
  const collapseKey = `collapse-${id}`;

  useEffect(() => {
    const collapsed = window.localStorage.getItem(collapseKey);
    if (collapsed === null || collapsed === 'true') {
      setIsOpen(true);
      updateStorage(true);
    }

    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === Command.closeSections) {
        setIsOpen(false);
        updateStorage(false);
      }
    });
  }, ['']);

  const updateStorage = (value: boolean) => {
    window.localStorage.setItem(collapseKey, value.toString());
  }

  // This is a work around for a lit-element issue of duplicate slot names
  const triggerClick = (e: React.MouseEvent<HTMLElement>) => {
    if ((e.target as any).tagName.toUpperCase() === 'VSCODE-COLLAPSIBLE') {
      setIsOpen(prev => {
        if (sendUpdate) {
          sendUpdate(!prev);
        }

        updateStorage(!prev);
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

Collapsible.displayName = 'Collapsible';
export { Collapsible };