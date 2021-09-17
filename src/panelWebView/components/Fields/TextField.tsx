import { PencilIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { VsLabel } from '../VscodeComponents';

export interface ITextFieldProps {
  label: string;
  value: string | null;
  limit: number | undefined;
  rows?: number;
  onChange: (txtValue: string) => void;
}

export const TextField: React.FunctionComponent<ITextFieldProps> = ({limit, label, value, rows, onChange}: React.PropsWithChildren<ITextFieldProps>) => {
  const [ text, setText ] = React.useState<string | null>(value);
  
  const onTextChange = (txtValue: string) => {
    setText(txtValue);
    onChange(txtValue);
  };

  React.useEffect(() => {
    if (text !== value) {
      setText(value);
    }
  }, [ value ]);

  return (
    <div className={`metadata_field`}>
      <VsLabel>
        <div className={`metadata_field__label`}>
          <PencilIcon style={{ width: "16px", height: "16px" }} /> <span style={{ lineHeight: "16px"}}>{label}</span>
        </div>
      </VsLabel>
      
      <textarea
        className={`metadata_field__textarea`}
        rows={rows || 2}
        value={text || ""}  
        onChange={(e) => onTextChange(e.currentTarget.value)} style={{
        border: !limit || ((text || "").length < limit) ? "1px solid var(--vscode-inputValidation-infoBorder)" : "1px solid var(--vscode-inputValidation-warningBorder)"
      }} />

      {
        limit && (text || "").length >= limit && (
          <div className={`metadata_field__limit`}>
            Field limit reached {(text || "").length}/{limit}
          </div>
        )
      }
    </div>
  );
};