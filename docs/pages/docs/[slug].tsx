import React from 'react';
import ReactMarkdown from 'react-markdown';
import { getAllPosts, getPostByFilename } from '../../lib/api';
import { useRouter } from 'next/router';
import rehypeRaw from 'rehype-raw';
import { Description, OtherMeta, Title } from '../../components/Meta';
import { Layout } from '../../components/Page/Layout';

export default function News({ page }: any) {

  const router = useRouter()
  if (!router.isFallback && !page?.slug) {
    return <p>Error</p>
  }

  return (
    <>
      <Title value={page.title} />
      <Description value={page.description} />
      <OtherMeta image={page.image} type={`article`} />

      <Layout>
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
          children={page.content} />
      </Layout>
    </>
  )
}

export async function getStaticProps({ params }: any) {
  const blogItems = getAllPosts('docs', ['fileName', 'slug']);
  const article: any = blogItems.find((b: any) => b.slug === params.slug);

  const blog: any = getPostByFilename('docs', article.fileName, [
    'title',
    'date',
    'content',
    'slug',
    'fileName',
    'category',
    'description',
    'image'
  ])

  return {
    props: {
      page: {
        ...blog
      }
    }
  }
}

export async function getStaticPaths() {
  const blogItems = getAllPosts('docs', [
    'title',
    'date',
    'slug',
    'fileName',
    'category',
    'description',
    'image'
  ])

  return {
    paths: blogItems.map((news: any) => {
      return {
        params: {
          slug: news.slug,
          fileName: news.fileName
        }
      }
    }),
    fallback: false
  }
}