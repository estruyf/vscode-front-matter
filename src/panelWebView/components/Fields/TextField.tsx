import { PencilIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useRecoilState } from 'recoil';
import { BaseFieldProps } from '../../../models';
import { RequiredFieldsAtom } from '../../state';
import { FieldTitle } from './FieldTitle';
import { FieldMessage } from './FieldMessage';

export interface ITextFieldProps extends BaseFieldProps<string> {
  singleLine: boolean | undefined;
  wysiwyg: boolean | undefined;
  limit: number | undefined;
  rows?: number;
  onChange: (txtValue: string) => void;
}

const WysiwygField = React.lazy(() => import('./WysiwygField'));

export const TextField: React.FunctionComponent<ITextFieldProps> = ({
  singleLine,
  wysiwyg,
  limit,
  label,
  description,
  value,
  rows,
  onChange,
  required
}: React.PropsWithChildren<ITextFieldProps>) => {
  const [, setRequiredFields] = useRecoilState(RequiredFieldsAtom);
  const [text, setText] = React.useState<string | null>(value);

  const onTextChange = (txtValue: string) => {
    setText(txtValue);
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

  useEffect(() => {
    if (text !== value) {
      setText(value);
    }
  }, [value]);

  return (
    <div className={`metadata_field`}>
      <FieldTitle label={label} icon={<PencilIcon />} required={required} />

      {wysiwyg ? (
        <React.Suspense fallback={<div>Loading field</div>}>
          <WysiwygField text={text || ''} onChange={onTextChange} />
        </React.Suspense>
      ) : singleLine ? (
        <input
          className={`metadata_field__input`}
          value={text || ''}
          onChange={(e) => onTextChange(e.currentTarget.value)}
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
          style={{
            border
          }}
        />
      )}

      {limit && limit > 0 && (text || '').length > limit && (
        <div className={`metadata_field__limit`}>
          Field limit reached {(text || '').length}/{limit}
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
