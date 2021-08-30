import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { features } from '../../constants/features';
import { CheckIcon } from '@heroicons/react/outline';

export interface IFeaturesProps {}

export const Features: React.FunctionComponent<IFeaturesProps> = (props: React.PropsWithChildren<IFeaturesProps>) => {
  const { t: strings } = useTranslation();

  return (
    <div className={``}>
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold">{strings(`features_title`)}</h2>
          <p className="mt-4 text-lg text-whisper-700">
            {strings(`features_description`)}
          </p>
        </div>
        <dl className="mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8">
          {features.map((feature) => (
            <div key={feature.name} className="relative">
              <dt>
                <CheckIcon className="absolute h-6 w-6 text-teal-500" aria-hidden="true" />
                <p className="ml-9 text-lg leading-6 font-medium text-whisper-500">{strings(feature.name)}</p>
              </dt>
              <dd className="mt-2 ml-9 text-base text-whisper-800">{strings(feature.description)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};