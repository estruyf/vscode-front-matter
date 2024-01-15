import { HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { REVIEW_LINK, SPONSOR_LINK } from '../../../constants';
import { VersionInfo } from '../../../models';
import useThemeColors from '../../hooks/useThemeColors';
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
  const { getColors } = useThemeColors();

  return (
    <a
      className={`group inline-flex justify-center items-center space-x-2 opacity-50 hover:opacity-100 ${getColors(
        `text-vulcan-500 dark:text-whisper-500 hover:text-vulcan-600 dark:hover:text-whisper-300`,
        `text-[var(--vscode-editor-foreground)] hover:text-[var(--vscode-textLink-foreground)]]`
      )
        }`}
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
  const { getColors } = useThemeColors();

  return (
    <footer
      className={`w-full px-4 py-2 text-center space-x-8 flex items-center border-t ${isBacker ? 'justify-center' : 'justify-between'
        } ${getColors(
          'bg-gray-100 dark:bg-vulcan-500 text-vulcan-50 dark:text-whisper-900 border-gray-200 dark:border-vulcan-300',
          'bg-[var(--vscode-editor-background)] text-[var(--vscode-editor-foreground)] border-[var(--frontmatter-border)]'
        )
        }`}
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
