import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Description, OtherMeta, Title } from '../../components/Meta';
import { Layout } from '../../components/Page/Layout';
import { getPostByFilename } from '../../lib/api';

export default function Home({ content }: any) {
  const { t: strings } = useTranslation();
  
  return (
    <>
      <Title value={strings(`changelog_title`)} />
      <Description value={`changelog_description`} />
      <OtherMeta image={`/assets/frontmatter-preview.png`} />

      <Layout>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 divide-y-2 divide-vulcan-200">
          <div className="pb-8 space-y-2 md:space-y-5 ">
            <h1 className="text-5xl tracking-tight font-extrabold sm:leading-none lg:text-5xl xl:text-6xl">{strings(`changelog_page_title`)}</h1>
            
            <p className="mt-3 text-base text-whisper-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">{strings(`changelog_page_description`)}</p>
          </div>

          <div className={`changelog`}>
            {/* eslint-disable react/no-children-prop */}
            <ReactMarkdown 
              components={{
                a: ({node, ...props}) => {
                  const url = props?.href || "";
                  const title = props?.children.length > 0 ? `${props?.children[0] as string}` : "";
                  const elm = <a key={url as string} href={url as string} title={title}>{title}</a>;
                  return elm;
                }
              }}
              rehypePlugins={[rehypeRaw]} 
              children={content} />
          </div>          
        </div>
      </Layout>
    </>
  )
}

export const getStaticProps = async () => {
  const changes = getPostByFilename('changelog', "CHANGELOG.md", ['content']);

  return {
    props: { content: changes.content }
  }
}