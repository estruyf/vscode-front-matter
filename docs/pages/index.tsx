import type { NextPage } from 'next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Description, OtherMeta, Title } from '../components/Meta';
import { CTA, Features, Generators, Hero, Layout } from '../components/Page';
import { Extension } from '../constants/extension';

const Home: NextPage = () => {
  const { t: strings } = useTranslation();
  
  return (
    <>
      <Title value={Extension.home} />
      <Description value={Extension.description} />
      <OtherMeta image={`/assets/frontmatter-preview.png`} />
      
      <Layout>
        <CTA />

        <Generators />

        <Hero
          view={"left"}
          title={strings(`hero_title`)}
          description={(
            <>
              <p className="my-6 text-base text-whisper-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                {strings(`hero_description`)}
              </p>
              <p className="my-6 text-base text-whisper-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                {strings(`hero_description_second`)}
              </p>
            </>
          )}
          imgSrc={"https://res.cloudinary.com/estruyf/image/upload/w_1256/v1631520508/frontmatter/dashboard.png"}
          imgAlt={"Front Matter CMS editor dashboard of your static site content"}
          link={`/docs/getting-started`}
          linkText={strings(`hero_button_primary`)} />


        <Hero
          view={"right"}
          title={strings(`hero_media_title`)}
          description={strings(`hero_media_description`)}
          imgSrc={"https://res.cloudinary.com/estruyf/image/upload/w_1256/v1631871287/frontmatter/insert_media-3.2.0.png"}
          imgAlt={"Front Matter CMS - media management was never easier in VS Code"}
          link={`/docs/dashboard`}
          linkText={strings(`hero_media_button_primary`)}
          className={`-mt-12 sm:-mt-16`} />

        <Features />
      </Layout> 
    </>
  )
}

export default Home
