import { CodeIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { BaseFieldProps, CustomPanelViewResult } from '../../../models';
import { FieldMessage } from './FieldMessage';
import { FieldTitle } from './FieldTitle';

export interface ICustomFieldProps extends BaseFieldProps<any> {
  fieldData: {
    name: string,
    html: (data: any, onChange: (value: any) => void) => Promise<CustomPanelViewResult | undefined>,
  };
  onChange: (value: any) => void;
}

export const CustomField: React.FunctionComponent<ICustomFieldProps> = ({ label, value, required, description, fieldData, onChange }: React.PropsWithChildren<ICustomFieldProps>) => {
  const [customHtml, setCustomHtml] = useState<any>(null);

  const internalChange = (newValue: any) => {
    onChange(newValue);
  };

  const showRequiredState = useMemo(() => {
    return required && !value;
  }, [required, value]);

  useEffect(() => {
    if (fieldData.html) {
      fieldData.html(value, internalChange).then((data) => {
        if (data) {
          setCustomHtml(data);
        } else {
          setCustomHtml(null);
        }
      });
    }
  }, [fieldData, value]);

  if (!customHtml) {
    return null;
  }

  return (
    <div className={`metadata_field`}>
      <FieldTitle label={label} icon={<CodeIcon />} required={required} />

      <div className="metadata_field">
        <div dangerouslySetInnerHTML={{ __html: customHtml }} />
      </div>

      <FieldMessage
        name={label.toLowerCase()}
        description={description}
        showRequired={showRequiredState}
      />
    </div>
  );
};