import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Command } from '../../Command';
import { CommandToCode } from '../../CommandToCode';
import { ImageFallback } from './ImageFallback';
import { PreviewImageValue } from './PreviewImageField';

export interface IPreviewImageProps {
  value: PreviewImageValue;
  onRemove: (value: string) => void;
}

export const PreviewImage: React.FunctionComponent<IPreviewImageProps> = ({
  value,
  onRemove
}: React.PropsWithChildren<IPreviewImageProps>) => {
  const [imgUrl, setImgUrl] = useState('');

  const listener = (event: any) => {
    const message = event.data;

    if (message.command === Command.sendMediaUrl) {
      const data = message.data;
      if (data?.original === value && data.url) {
        setImgUrl(data.url);
      }
    }
  };

  useEffect(() => {
    if (value?.webviewUrl) {
      setImgUrl(value.webviewUrl);
    } else {
      Messenger.send(CommandToCode.getImageUrl, value);
    }
  }, [value]);

  useEffect(() => {
    window.addEventListener('message', listener);

    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);

  return (
    <div className={`metadata_field__preview_image__preview`}>
      <ImageFallback src={imgUrl} />

      <button
        type="button"
        onClick={() => onRemove(value.original)}
        className={`metadata_field__preview_image__remove`}
      >
        Remove image
      </button>
    </div>
  );
};
