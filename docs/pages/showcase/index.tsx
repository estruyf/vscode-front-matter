import React from 'react';
import { useTranslation } from 'react-i18next';
import { Description, OtherMeta, Title } from '../../components/Meta';
import { Layout } from '../../components/Page/Layout';
import showcases from '../../showcases.json';

export default function Home({ showcases }: any) {
  const { t: strings } = useTranslation();
  
  return (
    <>
      <Title value={strings(`showcase_title`)} />
      <Description value={`showcase_description`} />
      <OtherMeta image={`/assets/frontmatter-preview.png`} />

      <Layout>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8 divide-y-2 divide-vulcan-200">
          <div className="py-8 space-y-2 md:space-y-5 ">
            <h1 className="text-5xl tracking-tight font-extrabold sm:leading-none lg:text-5xl xl:text-6xl">{strings(`showcase_title`)}</h1>
            
            <p className="mt-3 text-base text-whisper-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">{strings(`showcase_description`)}</p>
          </div>

          <div className={`py-8 grid grid-cols-2 gap-8`}>
            {showcases.filter((showcase: any) => showcase.image).map((showcase: any) => (
              <a key={showcase.title} className="group space-y-2 md:space-y-5 relative" href={showcase.link} title={showcase.title} rel={`noopener noreferrer`}>
                <figure className={`relative h-[25rem] overflow-hidden grayscale group-hover:grayscale-0`}>
                  <img className={`w-full object-cover`} src={`/showcases/${showcase.image}`} alt={showcase.title} loading={`lazy`} />
                </figure>

                <h2 className="text-3xl tracking-tight font-extrabold sm:leading-none lg:text-3xl xl:text-4xl">{showcase.title}</h2>

                <p className="mt-3 text-base text-whisper-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">{showcase.description}</p>
              </a>
            ))}
          </div>
        </div>
      </Layout>
    </>
  )
}

export const getStaticProps = async () => {
  return {
    props: { showcases }
  }
}