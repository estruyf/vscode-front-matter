import { Messenger } from '@estruyf/vscode/dist/client';
import { EventData } from '@estruyf/vscode/dist/models';
import {LinkIcon, RefreshIcon} from '@heroicons/react/outline';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { Command } from '../../Command';
import { CommandToCode } from '../../CommandToCode';
import { VsLabel } from '../VscodeComponents';

export interface ISlugFieldProps {
  label: string;
  value: string | null;
  titleValue: string | null;
  editable?: boolean;
  onChange: (txtValue: string) => void;
}

export const SlugField: React.FunctionComponent<ISlugFieldProps> = ({ label, editable, value, titleValue, onChange }: React.PropsWithChildren<ISlugFieldProps>) => {
  const [ text, setText ] = React.useState<string | null>(value);
  const [ slug, setSlug ] = React.useState<string | null>(value);

  useEffect(() => {
    if (text !== value) {
      setText(value);
    }
  }, [ value ]);
  
  const onTextChange = (txtValue: string) => {
    setText(txtValue);
    onChange(txtValue);
  };

  const updateSlug = () => {
    Messenger.send(CommandToCode.updateSlug);
  };

  const messageListener = useCallback((message: MessageEvent<EventData<any>>) => {
    const {command, data} = message.data;
    if (command === Command.updatedSlug) {
      setSlug(data?.slugWithPrefixAndSuffix);
    }
  }, [text]);

  useEffect(() => {
    if (titleValue) {
      Messenger.send(CommandToCode.generateSlug, titleValue);
    }
  }, [titleValue]);
  
  useEffect(() => {
    Messenger.listen(messageListener);

    return () => {
      Messenger.unlisten(messageListener);
    }
  }, []);

  return (
    <div className={`metadata_field`}>
      <VsLabel>
        <div className={`metadata_field__label`}>
          <LinkIcon style={{ width: "16px", height: "16px" }} /> <span style={{ lineHeight: "16px"}}>{label}</span>
        </div>
      </VsLabel>

      <div className='metadata_field__slug'>
        <input 
          className={`metadata_field__slug__input`}
          value={text || ""}
          disabled={editable !== undefined ? !editable : false}
          onChange={(e) => onTextChange(e.currentTarget.value)} />
        
        <button 
          title={slug !== text ? "Update available" : "Generate slug"}
          className={`metadata_field__slug__button ${slug !== text ? "metadata_field__slug__button_update" : ""}`}
          onClick={updateSlug}>
          <RefreshIcon aria-hidden={true} />
        </button>
      </div>
    </div>
  );
}