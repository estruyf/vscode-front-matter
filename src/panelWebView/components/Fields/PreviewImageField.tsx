import { PhotographIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { MessageHelper } from '../../../helpers/MessageHelper';
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
  multiple?: boolean;
  onChange: (value: string | string[] | null) => void;
}

export const PreviewImageField: React.FunctionComponent<IPreviewImageFieldProps> = ({label, fieldName, onChange, value, filePath, multiple}: React.PropsWithChildren<IPreviewImageFieldProps>) => {

  const selectImage = () => {
    MessageHelper.sendMessage(CommandToCode.selectImage, { 
      filePath: filePath,
      fieldName,
      value,
      multiple
    });
  };

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
              <span className="mt-2 block text-sm font-medium text-gray-900">Add your {label?.toLowerCase() || "image"}</span>
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