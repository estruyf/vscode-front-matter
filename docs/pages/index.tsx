import type { NextPage } from 'next';
import React from 'react';
import { Description, OtherMeta, Title } from '../components/Meta';
import { CTA, Features, Generators, Hero, Layout } from '../components/Page';
import { Extension } from '../constants/extension';

const Home: NextPage = () => {
  return (
    <>
      <Title value={Extension.home} />
      <Description value={Extension.description} />
      <OtherMeta image={`/assets/frontmatter-preview.png`} />
      
      <Layout>
        <CTA />

        <Generators />

        <Hero />

        <Features />
      </Layout> 
    </>
  )
}

export default Home
