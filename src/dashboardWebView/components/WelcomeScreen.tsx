import { HeartIcon, StarIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { GITHUB_LINK, REVIEW_LINK, SPONSOR_LINK } from '../../constants';
import { Messenger } from '@estruyf/vscode/dist/client';
import { FrontMatterIcon } from '../../panelWebView/components/Icons/FrontMatterIcon';
import { GitHubIcon } from '../../panelWebView/components/Icons/GitHubIcon';
import { DashboardMessage } from '../DashboardMessage';
import { Settings } from '../models/Settings';
import { StepsToGetStarted } from './Steps/StepsToGetStarted';

export interface IWelcomeScreenProps {
  settings: Settings;
}

export const WelcomeScreen: React.FunctionComponent<IWelcomeScreenProps> = ({settings}: React.PropsWithChildren<IWelcomeScreenProps>) => {

  React.useEffect(() => {
    return () => {
      Messenger.send(DashboardMessage.reload)
    };
  }, ['']);
  
  return (
    <div className={`h-full overflow-auto py-24`}>
      <main>
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-12 gap-8">
            <div className="px-6 col-span-8 text-left flex items-center">
              <div>
                <h1 className="mt-4 text-4xl tracking-tight font-extrabold sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
                  <span className="md:block">Manage your static site with</span>{' '}
                  <span className="text-teal-500 md:block">Front Matter</span>
                </h1>

                <p className="mt-3 text-base text-vulcan-300 dark:text-whisper-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  Thank you for using Front Matter!
                </p>

                <p className="mt-3 text-base text-vulcan-300 dark:text-whisper-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  We try to aim to make Front Matter as easy to use as possible, but if you have any questions or suggestions. Please don't hesitate to reach out to us on GitHub.
                </p>

                <div className="mt-5 w-full sm:mx-auto sm:max-w-lg lg:ml-0">
                  <div className="flex flex-wrap items-start justify-between">
                    <a href={GITHUB_LINK} title={`GitHub`} className="flex items-center px-1 text-vulcan-300 hover:text-vulcan-500 dark:text-whisper-500 dark:hover:text-teal-500">
                      <GitHubIcon className="w-8 h-8" />
                      <span className={`text-lg ml-2`}>GitHub / Documentation</span>
                    </a>
                    
                    <a href={SPONSOR_LINK} title={`Become a sponsor`} className="flex items-center px-1 text-vulcan-300 hover:text-vulcan-500 dark:text-whisper-500 dark:hover:text-teal-500">
                      <HeartIcon className="w-8 h-8" />
                      <span className={`text-lg ml-2`}>Sponsor</span>
                    </a>

                    <a href={REVIEW_LINK} title={`Write a quick review`} className="flex items-center px-1 text-vulcan-300 hover:text-vulcan-500 dark:text-whisper-500 dark:hover:text-teal-500">
                      <StarIcon className="w-8 h-8" />
                      <span className={`text-lg ml-2`}>Review</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-4 flex justify-center items-center">
              <FrontMatterIcon className={`h-64 w-64 text-vulcan-500 dark:text-whisper-500`} />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl mt-12 px-6">
          <h2 className="text-xl tracking-tight font-extrabold sm:leading-none">
            Perform the next steps to get you started with the extension
          </h2>

          <div className={`grid grid-cols-12 gap-8 mt-5`}>
            <div className={`col-span-8`}>
              <StepsToGetStarted settings={settings} />

              <p className="mt-5 text-sm text-vulcan-300 dark:text-whisper-700">
                Once you completed both actions, the dashboard will show its full potential. You can also use the extension from the <b>Front Matter</b> side panel. There you will find the actions you can perform specifically for your pages.
              </p>
            </div>
          </div>

          <h2 className="mt-5 text-lg tracking-tight font-extrabold sm:leading-none">
            We hope you enjoy Front Matter!
          </h2>
        </div>
      </main>
    </div>
  );
};