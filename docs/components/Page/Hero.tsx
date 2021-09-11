import Link from 'next/link';
import * as React from 'react';

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
    <div className={`px-4 sm:px-0 py-8 overflow-hidden lg:relative lg:py-48`}>
      <div className={`${className || ""} mx-auto sm:max-w-3xl sm:px-6 lg:px-8 lg:max-w-7xl lg:grid lg:grid-cols-2 lg:gap-24`}>
        <div className={`max-w-3xl mx-auto lg:py-48 lg:max-w-none lg:mx-0 lg:px-0 ${view === "left" ? `lg:col-start-2` : `lg:col-start-1`}`}>
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
      </div>

      <div className={`sm:mx-auto sm:max-w-3xl sm:px-6`}>
        <div className={`py-12 sm:relative sm:py-16 lg:absolute lg:inset-y-0 lg:w-1/2 ${view === "left" ? `lg:left-0` : `lg:right-0`}`}>
          <div className={`relative sm:mx-auto sm:max-w-3xl sm:px-0 lg:max-w-none lg:h-full ${view === "left" ? `` : `lg:-mr-40 lg:pl-12`}`}>
            <img className={`w-full lg:h-full lg:w-auto lg:max-w-none ${view === "left" ? `lg:absolute lg:right-0` : ''}`} 
                src={imgSrc}
                alt={imgAlt} />
          </div>
        </div>
      </div>
    </div>
  );
};