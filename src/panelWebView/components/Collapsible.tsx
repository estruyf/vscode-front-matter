import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { Command } from '../Command';
import { Pane as VSCodePane } from 'vscrui';

export interface ICollapsibleProps {
  id: string;
  title: string;
  className?: string;
  sendUpdate?: (open: boolean) => void;
}

const Collapsible: React.FunctionComponent<ICollapsibleProps> = ({
  id,
  children,
  title,
  sendUpdate,
  className
}: React.PropsWithChildren<ICollapsibleProps>) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const collapseKey = useMemo(() => `collapse_${id}`, [id]);

  useEffect(() => {
    if (!collapseKey) {
      return;
    }

    const prevState: any = Messenger.getState();

    if (
      !prevState ||
      !prevState[collapseKey] ||
      prevState[collapseKey] === null ||
      prevState[collapseKey] === 'true'
    ) {
      setIsOpen(true);
      updateStorage(true);
    } else {
      setIsOpen(false);
      updateStorage(false);
    }

    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.command === Command.closeSections) {
        setIsOpen(false);
        updateStorage(false);
      }
    });
  }, [collapseKey]);

  const updateStorage = (value: boolean) => {
    const prevState: any = Messenger.getState();
    Messenger.setState({
      ...prevState,
      [collapseKey]: value.toString()
    });
  };

  const triggerClick = (open: boolean) => {
    if (sendUpdate) {
      sendUpdate(open);
    }

    updateStorage(open);
    setIsOpen(open);
  };

  return (
    <VSCodePane
      title={title}
      onClick={triggerClick}
      open={isOpen}>
      <div className={`section collapsible__body overflow-y-auto ${className || ''}`}>
        {children}
      </div>
    </VSCodePane>
  );
};

Collapsible.displayName = 'Collapsible';
export { Collapsible };
