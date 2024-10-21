import { I18nConfig } from './i18nConfig';

export interface ContentFolder {
  title: string;
  path: string;

  disableCreation?: boolean;
  excludeSubdir?: boolean;
  excludePaths?: string[];
  previewPath?: string;
  trailingSlash?: boolean;
  filePrefix?: string;
  contentTypes?: string[];
  originalPath?: string;
  $schema?: string; // Extended config
  extended?: boolean; // Extended config

  locale?: string;
  localeTitle?: string;
  localeSourcePath?: string;
  defaultLocale?: string;
  locales?: I18nConfig[];
}
