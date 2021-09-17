import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Extension } from '../../constants/extension';
import { isProduction } from '../../helpers/isProduction';

export interface ICTAProps {}

export const CTA: React.FunctionComponent<ICTAProps> = (props: React.PropsWithChildren<ICTAProps>) => {
  const { t: strings } = useTranslation();

  return (
    <div className="px-4 sm:px-0 py-8 overflow-hidden lg:relative lg:py-48">
      <div className="mx-auto sm:max-w-3xl sm:px-6 lg:px-8 lg:max-w-7xl lg:grid lg:grid-cols-2 lg:gap-24">
        <div className={`my-4 sm:my-5 lg:my-6`}>
          <h1 className="text-5xl lg:text-5xl xl:text-6xl tracking-tight font-extrabold sm:leading-none">
            <span className="text-teal-500 md:block">{Extension.name}</span>{' '}
            <span className="block">{strings(`cta_title`)}</span>
            <span className={`sr-only`}>{strings(`cta_title_sr`)}</span>
          </h1>

          <h2 className="mt-3 text-base text-whisper-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
            {strings(`cta_description`)}
          </h2>

          <div className="mt-10 max-w-sm mx-auto sm:max-w-none">
            <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
              <a href={isProduction() ? Extension.installLink : Extension.installBetaLink} className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium shadow-sm text-white bg-teal-500 hover:bg-opacity-70 sm:px-8" rel={`noopener noreferrer`}>
                {isProduction() ? strings(`cta_button_primary`) : strings(`cta_button_beta_primary`)}
              </a>
              <a href={`/docs`} title={`Read our documentation`} className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium shadow-sm text-vulcan-500 bg-whisper-500 hover:bg-opacity-70 sm:px-8">
                {strings(`cta_button_secondary`)}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:max-w-3xl sm:px-6">
        <div className={`py-12 sm:relative sm:py-16 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2`}>
          <div className={`relative sm:mx-auto sm:max-w-3xl sm:px-0 lg:-mr-40 lg:max-w-none lg:h-full lg:pl-12`}>
            <img 
              className={`w-full lg:h-full lg:w-auto lg:max-w-none`} 
              src={`https://res.cloudinary.com/estruyf/image/upload/w_1256/v1631871148/frontmatter/preview-3.2.0.png`}
              alt={`Front Matter - Headless CMS - Live page preview`}
              loading={`lazy`} />
          </div>
        </div>
      </div>
    </div>
  );
};
