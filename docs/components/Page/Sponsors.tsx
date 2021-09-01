import * as React from 'react';
import { useTranslation } from 'react-i18next';

export interface ISponsorsProps {}

export const Sponsors: React.FunctionComponent<ISponsorsProps> = (props: React.PropsWithChildren<ISponsorsProps>) => {
  const { t: strings } = useTranslation();
  
  return (
    <div className="bg-vulcan-600">
      <div className="max-w-7xl mx-auto pt-12 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold uppercase text-whisper-900 tracking-wide">
          {strings(`sponsors_title`)}
        </p>

        <div className="mt-6">
          <a target={`_blank`}  rel={`noopener noreferrer`} href={`https://vercel.com/?utm_source=vscode-frontmatter&utm_campaign=oss`} title={`Powered by Vercel`} className="col-span-1 flex justify-center">
            <img className="h-12" src="/assets/sponsors/powered-by-vercel.svg" alt="Vercel" />
          </a>
        </div>
      </div>
    </div>
  );
};