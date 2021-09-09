import Link from 'next/link';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export interface IHeroProps {
  view: "left" | "right";
  title: string;
  description: string | JSX.Element;
  imgSrc: string;
  imgAlt: string;
  link?: string;
  linkText?: string;
  className?: string;
}

export const Hero: React.FunctionComponent<IHeroProps> = ({view, title, description, imgSrc, imgAlt, link, linkText, className}: React.PropsWithChildren<IHeroProps>) => {

  return (
    <div className={`overflow-hidden lg:relative`}>
      <div className={`${className || ""} px-4 sm:px-6 xl:px-0 py-12 sm:py-16 lg:relative lg:mx-auto lg:max-w-7xl lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24`}>
        <div className={`max-w-3xl mx-auto lg:py-32 lg:max-w-none lg:mx-0 lg:px-0 ${view === "left" ? `lg:col-start-2` : `lg:col-start-1`}`}>
          <div>
            <h2 className="text-3xl lg:text-3xl xl:text-4xl tracking-tight font-extrabold sm:leading-none">
              {title}
            </h2>
            {
              typeof description === 'string' ? (
                <p className="my-6 text-base text-whisper-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  {description}
                </p>
              ) : (
                {...description}
              )
            }
            {
              link && linkText && (
                <Link href={link} >
                  <a className={`inline-block px-4 py-3 border border-transparent text-base font-medium shadow-sm text-white bg-teal-500 hover:bg-opacity-70 sm:px-8`}>
                    {linkText}
                  </a>
                </Link>
              )
            }
          </div>
        </div>

        <div className={`sm:mx-auto sm:max-w-3xl sm:px-6 lg:px-0 lg:mx-0 lg:max-w-none mt-12 sm:mt-16 lg:mt-0 ${view === "left" ? `lg:col-start-1` : `lg:col-start-2`}`}>
          <div className={`${view === "left" ? `lg:pr-6 lg:-ml-16` : `lg:pl-6 lg:-mr-16`} lg:px-0 lg:m-0 lg:relative lg:h-full`}>
            <img className={`w-full rounded-xl lg:absolute lg:h-full lg:w-auto lg:max-w-none ${view === "left" ? `lg:right-0` : `lg:left-0`}`} 
                src={imgSrc}
                alt={imgAlt} />
          </div>
        </div>
      </div>
    </div>
  );
};