import * as React from 'react';
import { HeartIcon } from './Icons/HeartIcon';

export interface ISponsorMsgProps {}

export const SponsorMsg: React.FunctionComponent<ISponsorMsgProps> = (props: React.PropsWithChildren<ISponsorMsgProps>) => {
  return (
    <p className={`sponsor`}>
      <a href="https://github.com/sponsors/estruyf" title="Sponsor Front Matter">
        <span>Sponsor</span> <HeartIcon className={`h-5 w-5 mr-2`} /> <span>FrontMatter</span>
      </a>
    </p>
  );
};