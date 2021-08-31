import React from 'react';
import { getAllPosts, getPostByFilename } from '../../lib/api';
import { useRouter } from 'next/router';
import { Description, OtherMeta, Title } from '../../components/Meta';
import { Layout } from '../../components/Page/Layout';
import { useTranslation } from 'react-i18next';
import { Page } from '../../components/Docs/Page';
import { Markdown } from '../../components/Docs/Markdown';

export default function Documentation({ page, pages }: any) {
  const { t: strings } = useTranslation();
  const router = useRouter();

  if (!router.isFallback && !page?.slug) {
    return <p>Error</p>
  }

  return (
    <>
      <Title value={strings(`documentation_title`)} />
      <Description value={`documentation_description`} />
      <OtherMeta image={`/assets/frontmatter-preview.png`} />

      <Layout>
        <Page items={pages} page={page}>
          <Markdown content={page?.content} />
        </Page>
      </Layout>
    </>
  )
}

export async function getStaticProps({ params }: any) {
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

  const article: any = pages.find((b: any) => b.slug === params.slug);

  const doc: any = getPostByFilename('docs', article.fileName, [
    'title',
    'slug',
    'description',
    'date',
    'lastmod',
    'weight',
    'content',
    'fileName'
  ])

  return {
    props: {
      page: {
        ...doc
      },
      pages
    }
  }
}

export async function getStaticPaths() {
  const pages = getAllPosts('docs', ['slug', 'fileName']);

  return {
    paths: pages.map((page: any) => ({
      params: {
        slug: page.slug,
        fileName: page.fileName
      }
    })),
    fallback: false
  }
}