import { HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { REVIEW_LINK, SPONSOR_LINK } from '../../../constants';
import { VersionInfo } from '../../../models';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface ISponsorMsgProps {
  beta: boolean | undefined;
  version: VersionInfo | undefined;
  isBacker: boolean | undefined;
}

interface ISponsorLinkProps {
  title: string;
  href: string;
}

const SponsorLink: React.FunctionComponent<ISponsorLinkProps> = ({ title, href, children }: React.PropsWithChildren<ISponsorLinkProps>) => {
  return (
    <a
      className={`group inline-flex justify-center items-center space-x-2 opacity-50 hover:opacity-100 text-[var(--vscode-editor-foreground)] hover:text-[var(--vscode-textLink-foreground)]]`}
      href={href}
      title={title}
    >
      {children}
    </a>
  );
}

export const SponsorMsg: React.FunctionComponent<ISponsorMsgProps> = ({
  beta,
  isBacker,
  version
}: React.PropsWithChildren<ISponsorMsgProps>) => {
  return (
    <footer
      className={`w-full px-4 py-2 text-center space-x-8 flex items-center border-t ${isBacker ? 'justify-center' : 'justify-between'
        } bg-[var(--vscode-editor-background)] text-[var(--frontmatter-secondary-text)] border-[var(--frontmatter-border)]`}
    >
      {isBacker ? (
        <span>
          Front Matter
          {version ? ` (v${version.installedVersion}${!!beta ? ` BETA` : ''})` : ''}
        </span>
      ) : (
        <>
          <SponsorLink
            title={l10n.t(LocalizationKey.dashboardLayoutSponsorSupportMsg)}
            href={SPONSOR_LINK}>
            <span>{l10n.t(LocalizationKey.commonSupport)}</span>{` `}
            <HeartIcon className={`h-5 w-5 group-hover:fill-current`} />
          </SponsorLink>
          <span>
            Front Matter
            {version ? ` (v${version.installedVersion}${!!beta ? ` BETA` : ''})` : ''}
          </span>
          <SponsorLink
            title={l10n.t(LocalizationKey.dashboardLayoutSponsorReviewMsg)}
            href={REVIEW_LINK}>
            <StarIcon className={`h-5 w-5 group-hover:fill-current`} />{` `}
            <span>{l10n.t(LocalizationKey.dashboardLayoutSponsorReviewLabel)}</span>
          </SponsorLink>
        </>
      )}
    </footer>
  );
};
