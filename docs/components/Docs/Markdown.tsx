import { LinkIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import * as React from 'react';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export interface IMarkdownProps {
  content: string | undefined;
}

export const Markdown: React.FunctionComponent<IMarkdownProps> = ({content}: React.PropsWithChildren<IMarkdownProps>) => {

  const getTitle = (props: any) => {
    const title = props?.children.length > 0 ? `${props?.children[0] as string}` : "";
    return title;
  };

  const generateId = (props: any) => {
    const title = getTitle(props);
    return title.toLowerCase().replace(/\s/g, '-');
  };

  const generateLink = (props: any) => {
    return (
      <a href={`#${generateId(props)}`} aria-hidden="true" title={getTitle(props)} className={`hidden group-hover:inline-block`}>
        <LinkIcon className={`ml-4 h-6 inline-block`} />
      </a>
    );
  };

  useEffect(() => {
    const elms = document.querySelectorAll('blockquote > p > strong');
    for (let i = 0; i < elms.length; i++) {
      const elm = elms[i];
      if (elm.textContent?.toLowerCase() === "important") {
        elm.parentElement?.parentElement?.classList.add('important');
      }
    }
  }, ['']);
  
  if (!content) {
    return null;
  }

  return (
    <div className={`markdown`}>
      {/* eslint-disable react/no-children-prop */}
      <ReactMarkdown 
        components={{
          a: ({node, ...props}) => {
            const url = props?.href || "";
            const vscodeUrl = props && (props as any)["data-vscode"] ? (props as any)["data-vscode"] : "";
            const title = getTitle(props);
            if (vscodeUrl) {
              return <Link key={vscodeUrl as string} href={vscodeUrl as string}><a title={title}>{title}</a></Link>;
            }
            return <Link key={url as string} href={url as string}><a title={title}>{title}</a></Link>;
          },
          h1: ({node, ...props}) => (<h1 id={generateId(props)} className={`header__offset group`}>{getTitle(props)}{generateLink(props)}</h1>),
          h2: ({node, ...props}) => (<h2 id={generateId(props)} className={`header__offset group`}>{getTitle(props)}{generateLink(props)}</h2>),
          h3: ({node, ...props}) => (<h3 id={generateId(props)} className={`header__offset group`}>{getTitle(props)}{generateLink(props)}</h3>),
        }}
        rehypePlugins={[rehypeRaw]} 
        children={content} />
    </div>
  );
};