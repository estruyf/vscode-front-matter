import {PencilIcon} from '@heroicons/react/outline';
import * as React from 'react';
import { VsLabel } from '../VscodeComponents';

export interface ITextFieldProps {
  label: string;
  value: string | null;
  singleLine: boolean | undefined;
  wysiwyg: boolean | undefined;
  limit: number | undefined;
  rows?: number;
  onChange: (txtValue: string) => void;
}

const WysiwygField = React.lazy(() => import('./WysiwygField'));

export const TextField: React.FunctionComponent<ITextFieldProps> = ({singleLine, wysiwyg, limit, label, value, rows, onChange}: React.PropsWithChildren<ITextFieldProps>) => {
  const [ text, setText ] = React.useState<string | null>(value);

  React.useEffect(() => {
    if (text !== value) {
      setText(value);
    }
  }, [ value ]);
  
  const onTextChange = (txtValue: string) => {
    setText(txtValue);
    onChange(txtValue);
  };

  let isValid = true;
  if (limit && limit !== -1) {
    isValid = ((text || "").length <= limit);
  }

  return (
    <div className={`metadata_field`}>
      <VsLabel>
        <div className={`metadata_field__label`}>
          <PencilIcon style={{ width: "16px", height: "16px" }} /> <span style={{ lineHeight: "16px"}}>{label}</span>
        </div>
      </VsLabel>

      {
        wysiwyg ? (
          <React.Suspense fallback={(<div>Loading field</div>)}>
            <WysiwygField text={text || ""} onChange={onTextChange} />
          </React.Suspense>
        ) : (
          singleLine ? (
            <input 
              className={`metadata_field__input`}
              value={text || ""}
              onChange={(e) => onTextChange(e.currentTarget.value)} 
              style={{
                border: isValid ? "1px solid var(--vscode-inputValidation-infoBorder)" : "1px solid var(--vscode-inputValidation-warningBorder)"
              }} />
          ) : (
            <textarea
              className={`metadata_field__textarea`}
              rows={rows || 2}
              value={text || ""}  
              onChange={(e) => onTextChange(e.currentTarget.value)} 
              style={{
                border: isValid ? "1px solid var(--vscode-inputValidation-infoBorder)" : "1px solid var(--vscode-inputValidation-warningBorder)"
              }} />
          )
        )
      }

      {
        limit && limit > 0 && (text || "").length > limit && (
          <div className={`metadata_field__limit`}>
            Field limit reached {(text || "").length}/{limit}
          </div>
        )
      }
    </div>
  );
};