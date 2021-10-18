import * as React from 'react';
import { ImageFallback } from './ImageFallback';
import { PreviewImageValue } from './PreviewImageField';

export interface IPreviewImageProps {
  value: PreviewImageValue;
  onRemove: (value: string) => void;
}

export const PreviewImage: React.FunctionComponent<IPreviewImageProps> = ({ value, onRemove }: React.PropsWithChildren<IPreviewImageProps>) => {

  return (
    <div className={`metadata_field__preview_image__preview`}>
      <ImageFallback src={value.webviewUrl} />

      <button type="button" onClick={() => onRemove(value.original)} className={`metadata_field__preview_image__remove`}>Remove image</button>
    </div>
  );
};