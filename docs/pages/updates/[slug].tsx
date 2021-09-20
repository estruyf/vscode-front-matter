import React from 'react';
import { Markdown } from '../../components/Docs/Markdown';
import { Description, OtherMeta, Title } from '../../components/Meta';
import { Layout } from '../../components/Page/Layout';
import { getAllPosts, getPostByFilename } from '../../lib/api';

export default function Home({ title, content, description }: any) {
  
  return (
    <>
      <Title value={title} />
      <Description value={title} />
      <OtherMeta image={`/assets/frontmatter-preview.png`} />

      <Layout>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 divide-y-2 divide-vulcan-200">
          <div className="pb-8 space-y-2 md:space-y-5 ">
            <h1 className="text-5xl tracking-tight font-extrabold sm:leading-none lg:text-5xl xl:text-6xl">{title}</h1>
            
            <p className="mt-3 text-base text-whisper-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">{description}</p>
          </div>

          <div className={`changelog`}>
            <Markdown content={content} />
          </div>          
        </div>
      </Layout>
    </>
  )
}

export const getStaticProps = async ({ params }: any) => {
  const changes = getPostByFilename('changelog', `${params.slug}.md`, ['title', 'content', 'description']);

  return {
    props: { ...changes }
  }
}

export async function getStaticPaths() {
  const pages = getAllPosts('changelog', ['slug', 'fileName']);

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