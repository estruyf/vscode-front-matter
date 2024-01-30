import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import { LinkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { BaseFieldProps } from '../../../models';
import { CommandToCode } from '../../CommandToCode';
import { FieldTitle } from './FieldTitle';
import { FieldMessage } from './FieldMessage';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface ISlugFieldProps extends BaseFieldProps<string> {
  titleValue: string | null;
  editable?: boolean;
  slugTemplate?: string;
  onChange: (txtValue: string) => void;
}

export const SlugField: React.FunctionComponent<ISlugFieldProps> = ({
  label,
  description,
  editable,
  value,
  titleValue,
  slugTemplate,
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
      messageHandler.request<{ slug: string; slugWithPrefixAndSuffix: string; }>(CommandToCode.generateSlug, {
        title: titleValue,
        slugTemplate
      }).then((slug) => {
        if (slug.slugWithPrefixAndSuffix) {
          setSlug(slug.slugWithPrefixAndSuffix);
        }
      }).catch((_) => {
        setSlug(null);
      });
    }
  }, [titleValue, slugTemplate]);

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
          title={slug !== text ? l10n.t(LocalizationKey.panelFieldsSlugFieldUpdate) : l10n.t(LocalizationKey.panelFieldsSlugFieldGenerate)}
          className={`metadata_field__slug__button ${slug !== text ? 'metadata_field__slug__button_update' : ''
            }`}
          onClick={updateSlug}
        >
          <ArrowPathIcon aria-hidden={true} />
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
