import { XCircleIcon } from '@heroicons/react/solid';
import * as React from 'react';

export interface IImageFallbackProps {
  src: string;
}

export const ImageFallback: React.FunctionComponent<IImageFallbackProps> = ({ src }: React.PropsWithChildren<IImageFallbackProps>) => {

  if (!src) {
    return (
      <div style={{
        width: '100%',
        height: '120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--button-secondary-hover-background)'
      }}>
        <XCircleIcon style={{
          height: '8rem',
          width: '8rem',
          color: 'var(--vscode-errorForeground)',
        }} />

        <p style={{
          marginBottom: '1rem',
          color: 'var(--button-secondary-foreground)',
        }}>The image couldn't be loaded</p>
      </div>
    );
  }

  return (
    <img src={src} />
  );
};