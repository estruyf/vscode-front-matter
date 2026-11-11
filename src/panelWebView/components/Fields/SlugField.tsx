import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import { LinkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { BaseFieldProps } from '../../../models';
import { CommandToCode } from '../../CommandToCode';
import { FieldTitle } from './FieldTitle';
import { FieldMessage } from './FieldMessage';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { useDebounce } from '../../../hooks/useDebounce';

const DEBOUNCE_TIME = 300;
// How long a local edit keeps precedence over incoming values that are not the echo of our own update
const EXTERNAL_UPDATE_GRACE = 1500;

const normalize = (val: string | null | undefined): string => val || '';

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
  // Timestamp of the last local edit, null when the field is in sync with the front matter
  const lastTypedRef = useRef<number | null>(null);
  // Last value we sent to, or accepted from, the extension host. Used to recognize the echo of our own update.
  const lastSentRef = useRef<string | undefined>(undefined);

  /**
   * Send the slug to the extension host when it is a local edit that was not sent yet
   */
  const sendText = (crntText: string | null) => {
    if (lastTypedRef.current === null) {
      // Not a local edit (ex. text was set from the incoming value)
      return;
    }

    const outgoing = normalize(crntText);
    const baseline = lastSentRef.current !== undefined ? lastSentRef.current : normalize(value);
    if (outgoing === baseline) {
      if (baseline === normalize(value)) {
        lastTypedRef.current = null;
      }
      return;
    }

    lastSentRef.current = outgoing;
    onChange(outgoing);
  };

  // A pending edit is sent when the field unmounts before the debounce time passed (ex. switching files)
  const debouncedText = useDebounce<string | null>(text, DEBOUNCE_TIME, sendText);

  const onTextChange = (txtValue: string) => {
    setText(txtValue);
    lastTypedRef.current = Date.now();
  };

  const updateSlug = () => {
    Messenger.send(CommandToCode.updateSlug);
  };

  const showRequiredState = useMemo(() => {
    return required && !text;
  }, [required, text]);

  useEffect(() => {
    const incoming = normalize(value);

    if (lastSentRef.current !== undefined && incoming === lastSentRef.current) {
      // Echo of our own update. When nothing was typed since, the field is in sync again.
      if (normalize(text) === incoming) {
        lastTypedRef.current = null;
      }
      return;
    }

    // Could be the (stale) echo of an older update or an external change (ex. the generate slug action).
    // While the user is typing, the local text wins; otherwise the incoming value is applied.
    const hasPendingEdit =
      lastTypedRef.current !== null && Date.now() - lastTypedRef.current < EXTERNAL_UPDATE_GRACE;
    if (hasPendingEdit) {
      return;
    }

    lastTypedRef.current = null;
    lastSentRef.current = incoming;
    if (text !== value) {
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    sendText(debouncedText);
  }, [debouncedText]);

  useEffect(() => {
    if (titleValue) {
      messageHandler.request<{ slug: string; slugWithPrefixAndSuffix: string; }>(CommandToCode.generateSlug, {
        title: titleValue,
        slugTemplate
      }).then((slug) => {
        if (typeof slug.slugWithPrefixAndSuffix === "string") {
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
