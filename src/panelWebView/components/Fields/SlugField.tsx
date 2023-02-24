import { Messenger } from '@estruyf/vscode/dist/client';
import { EventData } from '@estruyf/vscode/dist/models';
import { LinkIcon, RefreshIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { BaseFieldProps } from '../../../models';
import { Command } from '../../Command';
import { CommandToCode } from '../../CommandToCode';
import { FieldTitle } from './FieldTitle';
import { FieldMessage } from './FieldMessage';

export interface ISlugFieldProps extends BaseFieldProps<string> {
  titleValue: string | null;
  editable?: boolean;
  onChange: (txtValue: string) => void;
}

export const SlugField: React.FunctionComponent<ISlugFieldProps> = ({
  label,
  description,
  editable,
  value,
  titleValue,
  onChange,
  required
}: React.PropsWithChildren<ISlugFieldProps>) => {
  const [text, setText] = React.useState<string | null>(value);
  const [slug, setSlug] = React.useState<string | null>(value);

  const onTextChange = (txtValue: string) => {
    setText(txtValue);
    onChange(txtValue);
  };

  const updateSlug = () => {
    Messenger.send(CommandToCode.updateSlug);
  };

  const messageListener = useCallback(
    (message: MessageEvent<EventData<any>>) => {
      const { command, payload } = message.data;
      if (command === Command.updatedSlug) {
        setSlug(payload?.slugWithPrefixAndSuffix);
      }
    },
    [text]
  );

  const showRequiredState = useMemo(() => {
    return required && !text;
  }, [required, text]);

  useEffect(() => {
    if (text !== value) {
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    if (titleValue) {
      Messenger.send(CommandToCode.generateSlug, titleValue);
    }
  }, [titleValue]);

  useEffect(() => {
    Messenger.listen(messageListener);

    return () => {
      Messenger.unlisten(messageListener);
    };
  }, []);

  return (
    <div className={`metadata_field`}>
      <FieldTitle label={label} icon={<LinkIcon />} required={required} />

      <div className="metadata_field__slug">
        <input
          className={`metadata_field__slug__input`}
          value={text || ''}
          disabled={editable !== undefined ? !editable : false}
          onChange={(e) => onTextChange(e.currentTarget.value)}
          style={{
            borderColor: showRequiredState ? 'var(--vscode-inputValidation-errorBorder)' : undefined
          }}
        />

        <button
          title={slug !== text ? 'Update available' : 'Generate slug'}
          className={`metadata_field__slug__button ${slug !== text ? 'metadata_field__slug__button_update' : ''
            }`}
          onClick={updateSlug}
        >
          <RefreshIcon aria-hidden={true} />
        </button>
      </div>

      <FieldMessage
        name={label.toLowerCase()}
        description={description}
        showRequired={showRequiredState}
      />
    </div>
  );
};
