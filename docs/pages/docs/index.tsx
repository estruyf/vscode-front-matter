import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Markdown } from '../../components/Docs/Markdown';
import { Page } from '../../components/Docs/Page';
import { Description, OtherMeta, Title } from '../../components/Meta';
import { Layout } from '../../components/Page/Layout';
import { getAllPosts } from '../../lib/api';
import { PageFrontMatter } from '../../models/PageFrontMatter';

export default function Home({ pages }: { pages: PageFrontMatter[] }) {
  const { t: strings } = useTranslation();

  const welcome = pages?.find(p => p.slug === "index");
  
  return (
    <>
      <Title value={strings(`documentation_title`)} />
      <Description value={`documentation_description`} />
      <OtherMeta image={`/assets/frontmatter-preview.png`} />

      <Layout>
        <Page items={pages} page={welcome}>
          <Markdown content={welcome?.content} />
        </Page>
      </Layout>
    </>
  )
}

export const getStaticProps = async () => {
  const pages = getAllPosts('docs', [
    'title',
    'slug',
    'description',
    'date',
    'lastmod',
    'weight',
    'content',
    'fileName'
  ]);

  return {
    props: { pages },
  }
}