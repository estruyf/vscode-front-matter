import type { NextPage } from 'next';
import React from 'react';
import { Description, OtherMeta, Title } from '../components/Meta';
import { CTA } from '../components/Page/CTA';
import { Features } from '../components/Page/Features';
import { Generators } from '../components/Page/Generators';
import { Layout } from '../components/Page/Layout';
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

        <Features />
      </Layout> 
    </>
  )
}

export default Home
