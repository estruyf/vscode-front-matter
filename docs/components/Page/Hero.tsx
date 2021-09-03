import Link from 'next/link';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export interface IHeroProps {}

export const Hero: React.FunctionComponent<IHeroProps> = (props: React.PropsWithChildren<IHeroProps>) => {
  const { t: strings } = useTranslation();

  return (
    <div className="px-4 sm:px-0 pt-8 py-12 sm:py-16 lg:relative lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24">
      <div className="px-4 max-w-3xl mx-auto sm:px-6 lg:py-32 lg:max-w-none lg:mx-0 lg:px-0 lg:col-start-2">
        <div>
          <h2 className="text-3xl lg:text-3xl xl:text-4xl tracking-tight font-extrabold sm:leading-none">
            {strings(`hero_title`)}
          </h2>
          <p className="my-6 text-base text-whisper-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
            {strings(`hero_description`)}
          </p>
          <p className="my-6 text-base text-whisper-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
            {strings(`hero_description_second`)}
          </p>
          <Link href={`/docs/getting-started`} >
            <a className={`inline-block px-4 py-3 border border-transparent text-base font-medium shadow-sm text-white bg-teal-500 hover:bg-opacity-70 sm:px-8`}>
              {strings(`hero_button_primary`)}
            </a>
          </Link>
        </div>
      </div>

      <div className="sm:mx-auto sm:max-w-3xl sm:px-6 lg:mx-0 lg:max-w-none mt-12 sm:mt-16 lg:mt-0 lg:col-start-1">
        <div className="lg:pr-6 lg:-ml-16 lg:px-0 lg:m-0 lg:relative lg:h-full">
          <img className="w-full rounded-xl lg:absolute lg:right-0 lg:h-full lg:w-auto lg:max-w-none" 
               src="/assets/dashboard.png" 
               alt="Front Matter CMS editor dashboard of your static site content" />
        </div>
      </div>
    </div>
  );
};