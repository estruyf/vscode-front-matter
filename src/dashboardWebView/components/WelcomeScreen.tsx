import { HeartIcon, StarIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { GITHUB_LINK, REVIEW_LINK, SPONSOR_LINK, TelemetryEvent } from '../../constants';
import { Messenger } from '@estruyf/vscode/dist/client';
import { FrontMatterIcon } from '../../panelWebView/components/Icons/FrontMatterIcon';
import { GitHubIcon } from '../../panelWebView/components/Icons/GitHubIcon';
import { DashboardMessage } from '../DashboardMessage';
import { Settings } from '../models/Settings';
import { StepsToGetStarted } from './Steps/StepsToGetStarted';
import useThemeColors from '../hooks/useThemeColors';
import { WelcomeLink } from './WelcomeView/WelcomeLink';

export interface IWelcomeScreenProps {
  settings: Settings;
}

export const WelcomeScreen: React.FunctionComponent<IWelcomeScreenProps> = ({
  settings
}: React.PropsWithChildren<IWelcomeScreenProps>) => {
  const { getColors } = useThemeColors();

  React.useEffect(() => {
    Messenger.send(DashboardMessage.sendTelemetry, {
      event: TelemetryEvent.webviewWelcomeScreen
    });

    const crntState: any = Messenger.getState() || {};
    Messenger.setState({
      ...crntState,
      isWelcomeConfiguring: true
    });

    return () => {
      Messenger.send(DashboardMessage.reload);
    };
  }, []);

  return (
    <div className={`h-full overflow-auto py-8`}>
      <main>
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-12 gap-8">
            <div className="px-6 col-span-8 text-left flex items-center">
              <div>
                <h1 className="mt-4 text-4xl tracking-tight font-extrabold sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
                  <span className="md:block">Manage your static site with</span>{' '}
                  <span className={`md:block ${getColors('text-teal-600', 'text-[var(--frontmatter-button-background)]')
                    }`}>Front Matter</span>
                </h1>

                <p className={`mt-3 text-base  sm:mt-5 sm:text-xl lg:text-lg xl:text-xl ${getColors(
                  'text-vulcan-300 dark:text-whisper-700',
                  'text-[var(--vscode-editor-foreground)]'
                )
                  }`}>
                  Thank you for using Front Matter!
                </p>

                <p className={`mt-3 text-base sm:mt-5 sm:text-xl lg:text-lg xl:text-xl ${getColors(
                  'text-vulcan-300 dark:text-whisper-700',
                  'text-[var(--vscode-editor-foreground)]'
                )
                  }`}>
                  We try to aim to make Front Matter as easy to use as possible, but if you have any
                  questions or suggestions. Please don't hesitate to reach out to us on GitHub.
                </p>

                <div className="mt-5 w-full sm:mx-auto sm:max-w-lg lg:ml-0">
                  <div className="flex flex-wrap items-start justify-between">
                    <WelcomeLink href={GITHUB_LINK} title={`GitHub`}>
                      <GitHubIcon className="w-8 h-8" />
                      <span className={`text-lg ml-2`}>GitHub / Documentation</span>
                    </WelcomeLink>

                    <WelcomeLink href={SPONSOR_LINK} title={`Become a sponsor`}>
                      <HeartIcon className="w-8 h-8" />
                      <span className={`text-lg ml-2`}>Sponsor</span>
                    </WelcomeLink>

                    <WelcomeLink href={REVIEW_LINK} title={`Write a quick review`}>
                      <StarIcon className="w-8 h-8" />
                      <span className={`text-lg ml-2`}>Review</span>
                    </WelcomeLink>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-4 flex justify-center items-center">
              <FrontMatterIcon className={`h-64 w-64 ${getColors(
                'text-vulcan-500 dark:text-whisper-500',
                'text-[var(--vscode-editor-foreground)]'
              )
                }`} />
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

              <p className={`mt-5 text-sm  ${getColors(
                'text-vulcan-300 dark:text-whisper-700',
                'text-[var(--vscode-editor-foreground)]'
              )
                }`}>
                You can also use the extension from the <b>Front Matter</b> side panel. There you
                will find the actions you can perform specifically for your pages.
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
