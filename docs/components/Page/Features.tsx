import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { features } from '../../constants/features';
import { CheckIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import { Extension } from '../../constants/extension';

export interface IFeaturesProps {}

export const Features: React.FunctionComponent<IFeaturesProps> = (props: React.PropsWithChildren<IFeaturesProps>) => {
  const { t: strings } = useTranslation();

  return (
    <div className={`bg-whisper-500 text-vulcan-500`}>
      <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold">{strings(`features_title`)}</h2>
          <p className="mt-4 text-lg text-vulcan-300">
            {strings(`features_description`)}
          </p>
        </div>
        <dl className="mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8">
          {features.map((feature) => (
            <div key={feature.name} className="relative">
              <dt>
                <CheckIcon className="absolute h-6 w-6 text-teal-800" aria-hidden="true" />
                <p className="ml-9 text-lg leading-6 font-medium text-vulcan-320">{strings(feature.name)}</p>
              </dt>
              <dd className="mt-2 ml-9 text-base text-vulcan-100">{strings(feature.description)}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-col justify-center items-center">
          <p className={`text-xl tracking-tight font-bold sm:leading-none text-vulcan-50`}>
            {strings(`features_cta_title`)}
          </p>
          <p className="mt-4">
            <Link href={Extension.featureLink} >
              <a className={`inline-block px-4 py-3 border border-transparent text-base font-medium shadow-sm text-white bg-vulcan-50 hover:bg-opacity-70 sm:px-8`}
                 target={`_blank`}
                 rel={`noopener noreferrer`}>
                {strings(`features_cta_button`)}
              </a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};