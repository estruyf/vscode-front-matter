import React from 'react';
import { useTranslation } from 'react-i18next';
import { Description, OtherMeta, Title } from '../../components/Meta';
import { Layout } from '../../components/Page/Layout';
import { getAllPosts } from '../../lib/api';

export default function Home({ docs }: any) {
  const { t: strings } = useTranslation();
  
  return (
    <>
      <Title value={strings(`documentation_title`)} />
      <Description value={`documentation_description`} />
      <OtherMeta image={`/assets/frontmatter-preview.png`} />

      <Layout>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
          <div className="text-6xl text-whisper-500">
            Coming soon...
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