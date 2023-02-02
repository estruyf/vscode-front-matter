import { Messenger } from '@estruyf/vscode/dist/client';
import { ExternalLinkIcon, RefreshIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useRef } from 'react';
import { PreviewCommands } from '../../../constants';

export interface IPreviewProps {
  url: string | null;
}

export const Preview: React.FunctionComponent<IPreviewProps> = ({
  url
}: React.PropsWithChildren<IPreviewProps>) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const onRefresh = () => {
    if (iframeRef.current?.src) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const openInBrowser = () => {
    Messenger.send(PreviewCommands.toVSCode.open, url);
  };

  return (
    <div className="w-full h-full bg-white">
      <div
        className="slug fixed w-full top-0 flex items-center"
        style={{
          height: '30px',
          background: 'var(--vscode-editor-background)',
          borderBottom: '1px solid var(--vscode-focusBorder)'
        }}
      >
        <input
          type="text"
          value={url || ''}
          className="w-full h-full border-0 bg-transparent text-xs py-1 px-2"
          style={{
            color: 'var(--vscode-editor-foreground)'
          }}
          disabled
        />

        <div
          className="actions absolute right-0 top-0 bottom-0 flex items-center space-x-2 px-2"
          style={{
            background: 'var(--vscode-editor-background)'
          }}
        >
          <button title="Refresh" onClick={onRefresh}>
            <RefreshIcon className="w-4 h-4" aria-hidden="true" />
          </button>

          <button title="Open" onClick={openInBrowser} className="mr-2">
            <ExternalLinkIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <iframe
        ref={iframeRef}
        src={url || ''}
        className={`w-full border-0`}
        style={{
          height: 'calc(100% - 30px)',
          marginTop: '30px'
        }}
      ></iframe>
    </div>
  );
};
