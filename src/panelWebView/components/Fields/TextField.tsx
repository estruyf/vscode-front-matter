import { PencilIcon, SparklesIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useRecoilState } from 'recoil';
import { BaseFieldProps, CustomScript, PanelSettings } from '../../../models';
import { RequiredFieldsAtom } from '../../state';
import { FieldTitle } from './FieldTitle';
import { FieldMessage } from './FieldMessage';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { CommandToCode } from '../../CommandToCode';
import { LocalizationKey, localize } from '../../../localization';
import { useDebounce } from '../../../hooks/useDebounce';
import { CopilotIcon } from '../Icons';

const DEBOUNCE_TIME = 300;

export interface ITextFieldProps extends BaseFieldProps<string> {
  singleLine: boolean | undefined;
  limit: number | undefined;
  rows?: number;
  name: string;
  placeholder?: string;
  settings: PanelSettings;
  actions?: CustomScript[];
  onChange: (txtValue: string) => void;
}

export const TextField: React.FunctionComponent<ITextFieldProps> = ({
  placeholder,
  singleLine,
  limit,
  label,
  description,
  value,
  rows,
  name,
  settings,
  onChange,
  actions,
  required
}: React.PropsWithChildren<ITextFieldProps>) => {
  const [, setRequiredFields] = useRecoilState(RequiredFieldsAtom);
  const [text, setText] = React.useState<string | null | undefined>(undefined);
  const [loading, setLoading] = React.useState<string | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = React.useState<number | null>(null);
  const debouncedText = useDebounce<string | null | undefined>(text, DEBOUNCE_TIME);

  const onTextChange = (txtValue: string) => {
    setText(txtValue);
    setLastUpdated(Date.now());
  };

  let isValid = true;
  if (limit && limit !== -1) {
    isValid = (text || '').length <= limit;
  }

  const updateRequired = useCallback(
    (isValid: boolean) => {
      setRequiredFields((prev) => {
        let clone = Object.assign([], prev);

        if (isValid) {
          clone = clone.filter((item) => item !== label);
        } else {
          clone.push(label);
        }

        return clone;
      });
    },
    [setRequiredFields]
  );

  const showRequiredState = useMemo(() => {
    return required && !text;
  }, [required, text]);

  const border = useMemo(() => {
    if (showRequiredState) {
      return '1px solid var(--vscode-inputValidation-errorBorder)';
    } else if (!isValid) {
      return '1px solid var(--vscode-inputValidation-warningBorder)';
    } else {
      return '1px solid var(--vscode-inputValidation-infoBorder)';
    }
  }, [showRequiredState, isValid]);


  const suggestTitle = () => {
    setLoading(localize(LocalizationKey.panelFieldsTextFieldAiGenerate));

    messageHandler
      .request<string>(CommandToCode.copilotSuggestTitle, text)
      .then((suggestion) => {
        setLoading(undefined);

        if (suggestion) {
          setText(suggestion);
          onChange(suggestion);
        }
      })
      .catch(() => {
        setLoading(undefined);
      });
  };

  const suggestDescription = (type: 'ai' | 'copilot') => {
    setLoading(localize(LocalizationKey.panelFieldsTextFieldAiGenerate));

    messageHandler
      .request<string>(
        type === 'copilot' ? CommandToCode.copilotSuggestDescription : CommandToCode.aiSuggestDescription
      )
      .then((suggestion) => {
        setLoading(undefined);

        if (suggestion) {
          setText(suggestion);
          onChange(suggestion);
        }
      })
      .catch(() => {
        setLoading(undefined);
      });
  };

  const actionElement = useMemo(() => {
    if (settings.seo.descriptionField !== name && settings.seo.titleField !== name) {
      return;
    }

    return (
      <>
        {settings?.aiEnabled && settings.seo.descriptionField === name && (
          <button
            className="metadata_field__title__action inline-block text-[var(--vscode-editor-foreground)] disabled:opacity-50"
            title={localize(LocalizationKey.panelFieldsTextFieldAiMessage, label?.toLowerCase())}
            type="button"
            onClick={() => suggestDescription('ai')}
            disabled={!!loading}
          >
            <SparklesIcon />
          </button>
        )}

        {settings?.copilotEnabled && (
          <button
            className="metadata_field__title__action inline-block text-[var(--vscode-editor-foreground)] disabled:opacity-50"
            title={localize(LocalizationKey.panelFieldsTextFieldCopilotMessage, label?.toLowerCase())}
            type="button"
            onClick={() => settings.seo.descriptionField === name ? suggestDescription('copilot') : suggestTitle()}
            disabled={!!loading}
          >
            <CopilotIcon />
          </button>
        )}
      </>
    );
  }, [settings?.aiEnabled, settings?.copilotEnabled, settings?.seo, name, actions, loading]);

  useEffect(() => {
    if (showRequiredState) {
      updateRequired(false);
    } else if (!isValid) {
      updateRequired(true);
    } else {
      updateRequired(true);
    }
  }, [showRequiredState, isValid]);

  useEffect(() => {
    if (text !== value && (lastUpdated === null || Date.now() - DEBOUNCE_TIME > lastUpdated)) {
      setText(value || null);
    }
    setLastUpdated(null);
  }, [value]);

  useEffect(() => {
    if (debouncedText !== undefined && value !== debouncedText && lastUpdated !== null) {
      onChange(debouncedText || '');
    }
  }, [debouncedText, value, lastUpdated]);

  return (
    <div className={`metadata_field`}>
      <FieldTitle
        label={label}
        actionElement={actionElement}
        icon={<PencilIcon />}
        required={required}
        isDisabled={!!loading}
        customActions={actions}
        triggerLoading={(message) => setLoading(message)}
        onChange={onTextChange}
      />

      <div className='relative'>
        {loading && (
          <div className="metadata_field__loading">
            {loading}
          </div>
        )}

        {singleLine ? (
          <input
            className={`metadata_field__input`}
            value={text || ''}
            onChange={(e) => onTextChange(e.currentTarget.value)}
            placeholder={placeholder}
            style={{
              border
            }}
          />
        ) : (
          <textarea
            className={`metadata_field__textarea`}
            rows={rows || 2}
            value={text || ''}
            onChange={(e) => onTextChange(e.currentTarget.value)}
            placeholder={placeholder}
            style={{
              border
            }}
          />
        )}
      </div>

      {limit && limit > 0 && (text || '').length > limit && (
        <div className={`metadata_field__limit`}>
          {localize(LocalizationKey.panelFieldsTextFieldLimit, `${(text || '').length}/${limit}`)}
        </div>
      )}

      <FieldMessage
        description={description}
        name={label.toLowerCase()}
        showRequired={showRequiredState}
      />
    </div>
  );
};
