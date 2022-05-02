import {PhotographIcon} from '@heroicons/react/outline';
import * as React from 'react';
import { useCallback } from 'react';
import { MessageHelper } from '../../../helpers/MessageHelper';
import { BlockFieldData } from '../../../models';
import { CommandToCode } from '../../CommandToCode';
import { VsLabel } from '../VscodeComponents';
import { PreviewImage } from './PreviewImage';

export interface PreviewImageValue {
  original: string;
  webviewUrl: string;
}

export interface IPreviewImageFieldProps {
  label: string;
  fieldName: string;
  value: PreviewImageValue | PreviewImageValue[] | null;
  filePath: string | null;
  parents?: string[];
  multiple?: boolean;
  blockData?: BlockFieldData;
  onChange: (value: string | string[] | null) => void;
}

export const PreviewImageField: React.FunctionComponent<IPreviewImageFieldProps> = ({
  label, 
  fieldName, 
  blockData, 
  onChange, 
  value, 
  filePath, 
  multiple, 
  parents
}: React.PropsWithChildren<IPreviewImageFieldProps>) => {

  const selectImage = useCallback(() => {
    MessageHelper.sendMessage(CommandToCode.selectImage, { 
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

  return (
    <div className={`metadata_field`}>
      <VsLabel>
        <div className={`metadata_field__label`}>
          <PhotographIcon style={{ width: "16px", height: "16px" }} /> <span style={{ lineHeight: "16px"}}>{label}</span>
        </div>
      </VsLabel>
      
      <div className={`metadata_field__preview_image ${multiple && value && (value as PreviewImageValue[]).length > 0 ? `metadata_field__multiple_images` : ''}`}>
        {
          (!value || multiple) && (
            <button className={`metadata_field__preview_image__button`} title={`Add your ${label?.toLowerCase() || "image"}`} type="button" onClick={selectImage}>
              <PhotographIcon />
              <span>Add your {label?.toLowerCase() || "image"}</span>
            </button>
          )
        }

        {
          value && !Array.isArray(value) && (
            <PreviewImage value={value} onRemove={() => onChange(null)} />
          )
        }

        {
          multiple && value && Array.isArray(value) && (
            value.map(image => (
              <PreviewImage key={image.original} value={image} onRemove={onImageRemove} />
            ))
          )
        }
      </div>
    </div>
  );
};