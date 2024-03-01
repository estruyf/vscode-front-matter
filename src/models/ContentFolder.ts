import { I18nConfig } from './i18nConfig';

export interface ContentFolder {
  title: string;
  path: string;

  disableCreation?: boolean;
  excludeSubdir?: boolean;
  previewPath?: string;
  filePrefix?: string;
  contentTypes?: string[];
  originalPath?: string;
  $schema?: string;
  extended?: boolean;

  locale?: string;
  localeTitle?: string;
  localeSourcePath?: string;
  defaultLocale?: string;
  locales?: I18nConfig[];
}
