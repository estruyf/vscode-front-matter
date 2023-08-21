import { Messenger } from '@estruyf/vscode/dist/client';
import { DocumentIcon, PaperClipIcon, TrashIcon } from '@heroicons/react/outline';
import { basename } from 'path';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { BaseFieldProps, BlockFieldData } from '../../../models';
import { CommandToCode } from '../../CommandToCode';
import { FieldTitle } from './FieldTitle';
import { FieldMessage } from './FieldMessage';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IFileFieldProps extends BaseFieldProps<string | string[] | null> {
  fieldName: string;
  filePath: string;
  multiple?: boolean;
  fileExtensions?: string[];
  parents?: string[];
  blockData?: BlockFieldData;
  onChange: (value: string | string[] | null) => void;
}

const File = ({ value, onRemove }: { value: string; onRemove: (value: string) => void }) => {
  return (
    <div className="metadata_field__file__list__item" title={value}>
      <div className="metadata_field__file__item__icon">
        <PaperClipIcon style={{ width: '16px', height: '16px' }} />
      </div>
      <span className="metadata_field__file__item__text" style={{ lineHeight: '16px' }}>
        {basename(value)}
      </span>

      <button
        className="metadata_field__file__item__remove"
        type="button"
        title={l10n.t(LocalizationKey.panelFieldsFileFieldDelete)}
        onClick={() => onRemove(value)}
      >
        <TrashIcon style={{ width: '16px', height: '16px' }} />
        <span className="sr-only">
          {l10n.t(LocalizationKey.panelFieldsFileFieldDelete)}
        </span>
      </button>
    </div>
  );
};

export const FileField: React.FunctionComponent<IFileFieldProps> = ({
  label,
  description,
  multiple,
  filePath,
  fileExtensions,
  fieldName,
  value,
  parents,
  blockData,
  onChange,
  required
}: React.PropsWithChildren<IFileFieldProps>) => {
  const selectFile = useCallback(() => {
    Messenger.send(CommandToCode.selectFile, {
      filePath,
      fieldName,
      value,
      multiple,
      parents,
      blockData,
      fileExtensions,
      type: 'file'
    });
  }, [filePath, fieldName, value, multiple, parents]);

  const onRemove = useCallback(
    (crntValue) => {
      const newValue = value && Array.isArray(value) ? value.filter((v) => v !== crntValue) : null;
      onChange(newValue);
    },
    [value]
  );

  const isEmpty = useMemo(() => {
    return !value || (Array.isArray(value) && value.length === 0);
  }, [value]);

  const showRequiredState = useMemo(() => {
    return required && isEmpty;
  }, [required, isEmpty]);

  return (
    <div className={`metadata_field`}>
      <FieldTitle label={label} icon={<DocumentIcon />} required={required} />

      <div className={`metadata_field__file ${showRequiredState ? 'required' : ''}`}>
        {(isEmpty || multiple) && (
          <button
            className={`metadata_field__file__button ${isEmpty ? '' : 'not_empty'}`}
            title={l10n.t(LocalizationKey.panelFieldsFileFieldAdd, (label?.toLowerCase() || 'file'))}
            type="button"
            onClick={selectFile}
          >
            <DocumentIcon />
            <span>{l10n.t(LocalizationKey.panelFieldsFileFieldAdd, (label?.toLowerCase() || 'file'))}</span>
          </button>
        )}

        <FieldMessage
          name={label.toLowerCase()}
          description={description}
          showRequired={showRequiredState}
        />

        {value && !Array.isArray(value) && (
          <div className="metadata_field__file__list">
            <File value={value} onRemove={onRemove} />
          </div>
        )}

        {multiple && value && Array.isArray(value) && (
          <div className="metadata_field__file__list multiple">
            {value.map((v, idx) => (
              <File key={idx} value={v} onRemove={onRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
