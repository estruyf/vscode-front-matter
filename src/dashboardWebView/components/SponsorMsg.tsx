import { HeartIcon, StarIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { REVIEW_LINK, SPONSOR_LINK } from '../../constants';
import { VersionInfo } from '../../models';

export interface ISponsorMsgProps {
  beta: boolean | undefined;
  version: VersionInfo | undefined;
}

export const SponsorMsg: React.FunctionComponent<ISponsorMsgProps> = ({beta, version}: React.PropsWithChildren<ISponsorMsgProps>) => {
  return (
    <p className={`w-full max-w-7xl mx-auto px-4 text-vulcan-50 dark:text-whisper-900 py-2 text-center space-x-8 flex items-center justify-between`}>
      <a className={`group inline-flex justify-center items-center space-x-2 text-vulcan-500 dark:text-whisper-500 hover:text-vulcan-600 dark:hover:text-whisper-300 opacity-50 hover:opacity-100`} href={SPONSOR_LINK} title="Support Front Matter">
        <span>Support</span> <HeartIcon className={`h-5 w-5 group-hover:fill-current`} /> 
      </a>
      <span>Front Matter{version ? ` (v${version.installedVersion}${!!beta ? ` BETA` : ''})` : ''}</span>
      <a className={`group inline-flex justify-center items-center space-x-2 text-vulcan-500 dark:text-whisper-500 hover:text-vulcan-600 dark:hover:text-whisper-300 opacity-50 hover:opacity-100`} href={REVIEW_LINK} title="Review Front Matter">
        <StarIcon className={`h-5 w-5 group-hover:fill-current`} /> <span>Review</span>
      </a>
    </p>
  );
};