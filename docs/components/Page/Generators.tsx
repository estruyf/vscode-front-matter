import * as React from 'react';
import { useTranslation } from 'react-i18next';

export interface IGeneratorsProps {}

export const Generators: React.FunctionComponent<IGeneratorsProps> = (props: React.PropsWithChildren<IGeneratorsProps>) => {
  const { t: strings } = useTranslation();

  return (
    <div className="bg-whisper-100">
      <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-sm font-semibold uppercase text-vulcan-500 tracking-wide">
          {strings(`generators_title`)}
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-1 flex justify-center">
            <img className="h-12" src="/assets/logos/11ty.svg" alt="11ty" />
          </div>
          <div className="col-span-1 flex justify-center">
            <img className="h-12" src="/assets/logos/docusaurus.svg" alt="Docusaurus" />
          </div>
          <div className="col-span-1 flex justify-center">
            <img className="h-12" src="/assets/logos/gatsby.svg" alt="Gatsby" />
          </div>
          <div className="col-span-1 flex justify-center">
            <img className="h-12" src="/assets/logos/hugo.svg" alt="Hugo" />
          </div>
          <div className="col-span-1 flex justify-center">
            <img className="h-12" src="/assets/logos/jekyll.svg" alt="Jekyll" />
          </div>
          <div className="col-span-1 flex justify-center">
            <img className="h-12" src="/assets/logos/nextjs.svg" alt="Next.js" />
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <p className={`text-2xl tracking-tight font-bold sm:leading-none text-vulcan-500`}>
            {strings(`generators_more`)}
          </p>
        </div>
      </div>
    </div>
  );
};