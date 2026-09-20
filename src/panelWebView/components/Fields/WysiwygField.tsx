import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ReactQuill = require('react-quill');
import 'react-quill/dist/quill.snow.css';

import { PencilIcon } from '@heroicons/react/24/outline';

import { unified } from "unified";
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import remarkStringify from "remark-stringify";

import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import rehypeStringify from 'rehype-stringify'

import { BaseFieldProps } from '../../../models';
import { FieldMessage, FieldTitle } from '.';
import { LocalizationKey, localize } from '../../../localization';
import { useRecoilState } from 'recoil';
import { RequiredFieldsAtom } from '../../state';
import { useDebounce } from '../../../hooks/useDebounce';

const DEBOUNCE_TIME = 500;
// How long a local edit keeps precedence over incoming values that are not the echo of our own update
const EXTERNAL_UPDATE_GRACE = 2000;

const normalize = (val: string | null | undefined): string => val || '';

function markdownToHtml(markdownText: string) {
  const file = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(remarkGfm)
    .use(rehypeStringify)
    .processSync(markdownText);

  const htmlContents = String(file);
  return htmlContents.replace(/<del>/g, '<s>').replace(/<\/del>/g, '</s>');
}

function htmlToMarkdown(htmlText: string) {
  const file = unified()
    .use(rehypeParse, { emitParseErrors: true, duplicateAttribute: false })
    .use(rehypeRemark)
    .use(remarkGfm)
    .use(remarkStringify)
    .processSync(htmlText);
  return String(file);
}

export type WYSIWYGType = "html" | "markdown";

export interface IWysiwygFieldProps extends BaseFieldProps<string> {
  name: string;
  limit?: number;
  type: WYSIWYGType;
  onChange: (txtValue: string) => void;
}

const WysiwygField: React.FunctionComponent<IWysiwygFieldProps> = ({
  label,
  description,
  value,
  type = "html",
  onChange,
  limit,
  required
}: React.PropsWithChildren<IWysiwygFieldProps>) => {
  const [, setRequiredFields] = useRecoilState(RequiredFieldsAtom);
  // Timestamp of the last local edit, null when the field is in sync with the front matter
  const lastTypedRef = React.useRef<number | null>(null);
  // Last value we sent to, or accepted from, the extension host. Used to recognize the echo of our own update.
  const lastSentRef = React.useRef<string | undefined>(undefined);
  const [text, setText] = React.useState<string | null | undefined>(type === "html" ? value : markdownToHtml(value || ""));
  const debouncedText = useDebounce<string | null | undefined>(text, DEBOUNCE_TIME);

  const onTextChange = (newValue: string) => {
    setText(newValue);
    lastTypedRef.current = Date.now();
  }

  const modules = React.useMemo(() => {
    const styles = ['bold', 'italic', 'strike'];

    if (type === "html") {
      styles.push('underline');
    }

    return {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        styles,
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean']
      ]
    };
  }, [type]);

  const isValid = React.useMemo(() => {
    let temp = true;
    if (limit && limit !== -1) {
      temp = (text || '').length <= limit;
    }
    return temp;
  }, [limit, text]);

  const updateRequired = React.useCallback(
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

  const showRequiredState = React.useMemo(() => {
    return required && !text;
  }, [required, text]);

  const border = React.useMemo(() => {
    if (showRequiredState) {
      updateRequired(false);
      return '1px solid var(--vscode-inputValidation-errorBorder)';
    } else if (!isValid) {
      updateRequired(true);
      return '1px solid var(--vscode-inputValidation-warningBorder)';
    } else {
      updateRequired(true);
      return '1px solid var(--vscode-inputValidation-infoBorder)';
    }
  }, [showRequiredState, isValid]);

  /**
   * Update the text value when the value changes
   */
  React.useEffect(() => {
    const incoming = normalize(value);

    if (lastSentRef.current !== undefined && incoming === lastSentRef.current) {
      // Echo of our own update, the local text is at least as recent
      lastTypedRef.current = null;
      return;
    }

    // Could be the (stale) echo of an older update or an external change. While the user is
    // typing, the local text wins; otherwise the incoming value is applied.
    const hasPendingEdit =
      lastTypedRef.current !== null && Date.now() - lastTypedRef.current < EXTERNAL_UPDATE_GRACE;
    if (hasPendingEdit) {
      return;
    }

    lastTypedRef.current = null;
    lastSentRef.current = incoming;
    setText(type === "html" ? value : markdownToHtml(value || ""));
  }, [value]);

  /**
   * Update the value when the debounced text changes
   */
  React.useEffect(() => {
    if (debouncedText === undefined || lastTypedRef.current === null) {
      // Not a local edit (ex. text was set from the incoming value)
      return;
    }

    const outgoing = normalize(type === "html" ? debouncedText : htmlToMarkdown(debouncedText || ""));
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
        icon={<PencilIcon />}
        required={required}
      />

      <ReactQuill
        modules={modules}
        value={text || ''}
        onChange={onTextChange}
        style={{ border }}
      />

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

export default WysiwygField;
