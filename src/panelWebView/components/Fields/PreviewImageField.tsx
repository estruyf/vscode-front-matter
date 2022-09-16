import { Messenger } from '@estruyf/vscode/dist/client';
import {PhotographIcon} from '@heroicons/react/outline';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { DefaultFieldValues } from '../../../constants';
import { BaseFieldProps, BlockFieldData } from '../../../models';
import { CommandToCode } from '../../CommandToCode';
import { FieldTitle } from './FieldTitle';
import { PreviewImage } from './PreviewImage';
import { FieldMessage } from './FieldMessage';

export interface PreviewImageValue {
  original: string;
  webviewUrl: string;
}

export interface IPreviewImageFieldProps extends BaseFieldProps<PreviewImageValue | PreviewImageValue[] | null> {
  fieldName: string;
  filePath: string | null;
  parents?: string[];
  multiple?: boolean;
  blockData?: BlockFieldData;
  onChange: (value: string | string[] | null) => void;
}

export const PreviewImageField: React.FunctionComponent<IPreviewImageFieldProps> = ({
  label, 
  description,
  fieldName, 
  blockData, 
  onChange, 
  value, 
  filePath, 
  multiple, 
  parents,
  required
}: React.PropsWithChildren<IPreviewImageFieldProps>) => {

  const selectImage = useCallback(() => {
    Messenger.send(CommandToCode.selectImage, { 
      filePath: filePath,
      fieldName,
      value,
      multiple,
      metadataInsert: true,
      parents,
      blockData,
      type: "media"
    });
  }, [filePath, fieldName, value, multiple, parents]);

  const onImageRemove = (imageToRemove: string) => {
    const newValue = value && Array.isArray(value) ? value.filter(image => image.original !== imageToRemove).map(i => i.original) : null;
    onChange(newValue);
  }

  const isFaultyImage = useMemo(() => {
    return typeof value === "string" && value === DefaultFieldValues.faultyCustomPlaceholder;
  }, [value])

  const showRequiredState = useMemo(() => {
    return required && isFaultyImage || !value;
  }, [required, value, isFaultyImage]);

  return (
    <div className={`metadata_field`}>
      <FieldTitle 
        label={label}
        icon={<PhotographIcon />}
        required={required} />

      <div className={`metadata_field__preview_image ${multiple && value && (value as PreviewImageValue[]).length > 0 ? `metadata_field__multiple_images` : ''} ${showRequiredState ? "required" : ""}`}>
        {
          (!value || isFaultyImage || multiple) && (
            <button className={`metadata_field__preview_image__button`} title={`Add your ${label?.toLowerCase() || "image"}`} type="button" onClick={selectImage}>
              <PhotographIcon />
              <span>Add your {label?.toLowerCase() || "image"}</span>
            </button>
          )
        }

        {
          (value && !Array.isArray(value) && !isFaultyImage) && (
            <PreviewImage value={value} onRemove={() => onChange(null)} />
          )
        }

        {
          (multiple && value && Array.isArray(value) && !isFaultyImage) && (
            value.map(image => (
              <PreviewImage key={image.original} value={image} onRemove={onImageRemove} />
            ))
          )
        }
      </div>
      
      <FieldMessage name={label.toLowerCase()} description={description} showRequired={showRequiredState} />
    </div>
  );
};