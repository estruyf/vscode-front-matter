import { Messenger } from '@estruyf/vscode/dist/client';
import { ArrowRightIcon, ExternalLinkIcon, RefreshIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { PreviewCommands } from '../../../constants';

export interface IPreviewProps {
  url: string | null;
}

export const Preview: React.FunctionComponent<IPreviewProps> = ({
  url
}: React.PropsWithChildren<IPreviewProps>) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ crntUrl, setCrntUrl ] = useState<string | null>(null);

  const onRefresh = () => {
    if (iframeRef.current?.src) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const openInBrowser = () => {
    Messenger.send(PreviewCommands.toVSCode.open, url);
  };

  const navigateToUrl = () => {
    let navUrl = crntUrl || url || '';
    if (!navUrl.startsWith('http')) {
      navUrl = `https://${navUrl}`;
      setCrntUrl(navUrl);
    }
    iframeRef.current!.src = navUrl;
  };

  useEffect(() => {
    setCrntUrl(url);
  }, [url]);

  return (
    <div className="w-full h-full bg-white">
      <div
        className="slug fixed h-[30px] w-full top-0 flex items-center bg-[var(--vscode-editor-background)] text-[color:var(--vscode-editor-background)] border-b border-b-[var(--vscode-focusBorder)]"
      >
        <input
          type="text"
          value={crntUrl || ''}
          onChange={(e) => setCrntUrl(e.currentTarget.value || "")}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              navigateToUrl();
            }
          }}
          className="w-full m-[1px] h-full border-1 border-transparent bg-transparent text-xs py-1 px-2 focus:border-color-blue-500 focus:outline-none"
          style={{
            color: 'var(--vscode-editor-foreground)'
          }}
        />

        <div
          className="actions absolute right-[1px] top-[1px] bottom-[1px] flex items-center space-x-2 px-2 text-gray-400 dark:text-whisper-900"
          style={{
            background: 'var(--vscode-editor-background)'
          }}
        >
          <button title="Navigate" onClick={navigateToUrl} className={`hover:text-vulcan-500 dark:hover:text-whisper-100`}>
            <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
          </button>

          <button title="Refresh" onClick={onRefresh} className={`hover:text-vulcan-500 dark:hover:text-whisper-100 mr-2`}>
            <RefreshIcon className="w-4 h-4" aria-hidden="true" />
          </button>

          <button title="Open" onClick={openInBrowser} className={`hover:text-vulcan-500 dark:hover:text-whisper-100 mr-2`}>
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
