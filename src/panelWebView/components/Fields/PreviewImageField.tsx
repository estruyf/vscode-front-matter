import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import { PhotographIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
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

export interface IPreviewImageFieldProps
  extends BaseFieldProps<PreviewImageValue | PreviewImageValue[] | string[] | null> {
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
  const [imageData, setImageData] = React.useState<PreviewImageValue | PreviewImageValue[] | null>(null);

  const selectImage = useCallback(() => {
    Messenger.send(CommandToCode.selectImage, {
      filePath: filePath,
      fieldName,
      value,
      multiple,
      metadataInsert: true,
      parents,
      blockData,
      type: 'media'
    });
  }, [filePath, fieldName, value, multiple, parents]);

  const onImageRemove = useCallback((imageToRemove: string) => {
    const newValue =
      imageData && Array.isArray(imageData)
        ? imageData.filter((image) => image.original !== imageToRemove).map((i) => i.original)
        : null;
    onChange(newValue);
  }, [imageData]);

  const isFaultyImage = useMemo(() => {
    return typeof value === 'string' && value === DefaultFieldValues.faultyCustomPlaceholder;
  }, [value]);

  const showRequiredState = useMemo(() => {
    return required && (isFaultyImage || !value);
  }, [required, value, isFaultyImage]);

  useEffect(() => {
    if (typeof value === 'string') {
      messageHandler.request<PreviewImageValue>(CommandToCode.processMediaData, value).then((data) => {
        setImageData(data);
      });
    } else if (Array.isArray(value)) {
      Promise.all(
        value.map((v) => {
          if (typeof v === 'string') {
            return messageHandler.request<PreviewImageValue>(CommandToCode.processMediaData, v);
          } else {
            return Promise.resolve(v);
          }
        })
      ).then((data) => {
        setImageData(data);
      });
    } else {
      setImageData(value);
    }
  }, [value]);

  return (
    <div className={`metadata_field`}>
      <FieldTitle label={label} icon={<PhotographIcon />} required={required} />

      <div
        className={`metadata_field__preview_image ${multiple && imageData && (imageData as PreviewImageValue[]).length > 0
          ? `metadata_field__multiple_images`
          : ''
          } ${showRequiredState ? 'required' : ''}`}
      >
        {(!imageData || isFaultyImage || multiple) && (
          <button
            className={`metadata_field__preview_image__button`}
            title={`Add your ${label?.toLowerCase() || 'image'}`}
            type="button"
            onClick={selectImage}
          >
            <PhotographIcon />
            <span>Add your {label?.toLowerCase() || 'image'}</span>
          </button>
        )}

        {imageData && !Array.isArray(imageData) && !isFaultyImage && (
          <PreviewImage value={imageData} onRemove={() => onChange(null)} />
        )}

        {multiple &&
          imageData &&
          Array.isArray(imageData) &&
          !isFaultyImage &&
          imageData.map((image) => (
            <PreviewImage key={image.original} value={image} onRemove={() => onImageRemove(image.original)} />
          ))}
      </div>

      <FieldMessage
        name={label.toLowerCase()}
        description={description}
        showRequired={showRequiredState}
      />
    </div>
  );
};
