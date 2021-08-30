import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Description, OtherMeta, Title } from '../../components/Meta';
import { Layout } from '../../components/Page/Layout';
import { Extension } from '../../constants/extension';
import { getAllPosts } from '../../lib/api';
import { getPostByFilename } from '../../lib/api';

export default function Home({ content }: any) {
  const { t: strings } = useTranslation();
  
  return (
    <>
      <Title value={strings(`documentation_title`)} />
      <Description value={`documentation_description`} />
      <OtherMeta image={`/assets/frontmatter-preview.png`} />

      <Layout>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
          <div className="text-6xl text-whisper-500 text-center">
            🚧 Working on it 🚧
          </div>
          
          <div className="mt-8 text-lg">
            The new documentation format is currently being created, but you can currently find the Front Matter documenation on the <a className={`text-teal-500 hover:text-teal-700`} href={Extension.githubLink}>GitHub repository</a>.
          </div>
        </div>
      </Layout>
    </>
  )
}

export const getStaticProps = async () => {
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
    props: { blogItems: blogItems.map(item => ({...item, type: 'blog'})) },
  }
}