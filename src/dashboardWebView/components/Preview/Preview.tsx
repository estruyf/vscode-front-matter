import { Messenger } from '@estruyf/vscode/dist/client';
import { ArrowRightIcon, ExternalLinkIcon, RefreshIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { PreviewCommands } from '../../../constants';
import useThemeColors from '../../hooks/useThemeColors';

export interface IPreviewProps {
  url: string | null;
}

export const Preview: React.FunctionComponent<IPreviewProps> = ({
  url
}: React.PropsWithChildren<IPreviewProps>) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [crntUrl, setCrntUrl] = useState<string | null>(null);
  const { getColors } = useThemeColors();

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
        className="slug fixed h-[30px] w-full top-0 flex items-center bg-[var(--vscode-editor-background)] text-[color:var(--vscode-editor-background)] border-b border-b-[var(--frontmatter-border)]"
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
          placeholder="Enter a URL"
          className="w-full m-[1px] h-full border-1 border-transparent text-xs py-1 px-2 focus:border-color-blue-500 bg-[var(--vscode-tab-activeBackground)] text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-tab-activeForeground)] focus:text-[var(--vscode-tab-activeForeground)] placeholder-[var(--vscode-input-placeholderForeground)] focus:outline-[var(--vscode-focusBorder)] focus:outline-1 focus:outline-offset-0 focus:shadow-none focus:border-[var(--vscode-focusBorder)"
        />

        <div
          className={`actions flex items-center space-x-2 px-2 ${getColors('text-vulcan-500 dark:text-whisper-100', 'text-[var(--vscode-list-activeSelectionForeground)]')
            }`}
        >
          <button title="Navigate" onClick={navigateToUrl} className={getColors(`hover:text-vulcan-500 dark:hover:text-whisper-100`, `hover:text-[var(--vscode-textLink-activeForeground)]`)}>
            <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
          </button>

          <button title="Refresh" onClick={onRefresh} className={`mr-2 ${getColors(`hover:text-vulcan-500 dark:hover:text-whisper-100`, `hover:text-[var(--vscode-textLink-activeForeground)]`)}`}>
            <RefreshIcon className="w-4 h-4" aria-hidden="true" />
          </button>

          <button title="Open" onClick={openInBrowser} className={`mr-2 ${getColors(`hover:text-vulcan-500 dark:hover:text-whisper-100`, `hover:text-[var(--vscode-textLink-activeForeground)]`)}`}>
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
