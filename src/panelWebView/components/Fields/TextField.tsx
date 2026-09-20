import { PencilIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
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
// How long a local edit keeps precedence over incoming values that are not the echo of our own update.
// This covers slow round trips (the value we get back could be the echo of an older update) without
// blocking external changes (ex. editing the front matter in the editor) forever.
const EXTERNAL_UPDATE_GRACE = 1500;

const normalize = (val: string | null | undefined): string => val || '';

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
  // Timestamp of the last local edit, null when the field is in sync with the front matter
  const lastTypedRef = useRef<number | null>(null);
  // Last value we sent to, or accepted from, the extension host. Used to recognize the echo of our own update.
  const lastSentRef = useRef<string | undefined>(undefined);
  const debouncedText = useDebounce<string | null | undefined>(text, DEBOUNCE_TIME);

  const onTextChange = (txtValue: string) => {
    setText(txtValue);
    lastTypedRef.current = Date.now();
  };

  /**
   * Apply a value that was generated for the user (ex. AI suggestion) and send it right away
   */
  const applyValue = (txtValue: string) => {
    setText(txtValue);
    lastTypedRef.current = null;
    lastSentRef.current = normalize(txtValue);
    onChange(txtValue);
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
          applyValue(suggestion);
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
          applyValue(suggestion);
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
  }, [settings?.copilotEnabled, settings?.seo, name, actions, loading]);

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
    const incoming = normalize(value);

    if (lastSentRef.current !== undefined && incoming === lastSentRef.current) {
      // Echo of our own update. When nothing was typed since, the field is in sync again.
      if (normalize(text) === incoming) {
        lastTypedRef.current = null;
      }
      return;
    }

    // Could be the (stale) echo of an older update or an external change. While the user is
    // typing, the local text wins; otherwise the incoming value is applied.
    const hasPendingEdit =
      lastTypedRef.current !== null && Date.now() - lastTypedRef.current < EXTERNAL_UPDATE_GRACE;
    if (hasPendingEdit) {
      return;
    }

    // Accept the incoming value as the new baseline for local edits
    lastTypedRef.current = null;
    lastSentRef.current = incoming;
    if (normalize(text) !== incoming) {
      setText(value || null);
    }
  }, [value]);

  useEffect(() => {
    if (debouncedText === undefined || lastTypedRef.current === null) {
      // Not a local edit (ex. text was set from the incoming value)
      return;
    }

    const outgoing = normalize(debouncedText);
    const baseline = lastSentRef.current !== undefined ? lastSentRef.current : normalize(value);
    if (outgoing === baseline) {
      if (baseline === normalize(value)) {
        lastTypedRef.current = null;
      }
      return;
    }

    lastSentRef.current = outgoing;
    onChange(outgoing);
  }, [debouncedText]);

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
