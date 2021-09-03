import React from 'react';
import { useTranslation } from 'react-i18next';
import { Description, OtherMeta, Title } from '../../components/Meta';
import { Layout } from '../../components/Page/Layout';
import { Extension } from '../../constants/extension';
import showcases from '../../showcases.json';
import Image from 'next/image';

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#0e131f" offset="20%" />
      <stop stop-color="#222733" offset="50%" />
      <stop stop-color="#0e131f" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

const sortTitle = (a: { title: string }, b: { title: string }) => {
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
};

export default function Home({ showcases }: any) {
  const { t: strings } = useTranslation();
  
  return (
    <>
      <Title value={strings(`showcase_title`)} />
      <Description value={`showcase_description`} />
      <OtherMeta image={`/assets/frontmatter-preview.png`} />

      <Layout>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 divide-y-2 divide-vulcan-200">
          <div className="pb-8 space-y-2 md:space-y-5 ">
            <h1 className="text-5xl tracking-tight font-extrabold sm:leading-none lg:text-5xl xl:text-6xl">{strings(`showcase_title`)}</h1>
            
            <p className="mt-3 text-base text-whisper-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">{strings(`showcase_description`)}</p>
          </div>

          <div className={`py-8 grid grid-cols-1 lg:grid-cols-2 gap-8`}>
            {showcases.filter((showcase: any) => showcase.image).sort(sortTitle).map((showcase: any) => (
              <a key={showcase.title} className="group space-y-2 md:space-y-5 relative" href={showcase.link} title={showcase.title} rel={`noopener noreferrer`}>
                <figure className={`relative h-64 lg:h-[25rem] overflow-hidden grayscale group-hover:grayscale-0`}>
                  <Image 
                    className={`w-full object-cover object-left-top`} 
                    src={`/showcases/${showcase.image}`}
                    alt={showcase.title} 
                    loading={`lazy`}
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(592, 400))}`}
                    width={592}
                    height={400}
                     />
                </figure>

                <h2 className="text-3xl tracking-tight font-extrabold sm:leading-none lg:text-3xl xl:text-4xl">{showcase.title}</h2>

                <p className="mt-3 text-base text-whisper-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">{showcase.description}</p>
              </a>
            ))}
          </div>

          <div className="">
            <div className="mt-8 text-sm">
              <p>Want to add your site to our showcase? Great, open a showcase on <a className="text-teal-500 hover:text-teal-900" href={Extension.showcaseLink} target="_blank" rel="noopener noreferrer">Github</a>!</p>
            </div>
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