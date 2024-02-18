import { I18nConfig } from '../../models';

export interface Page {
  // Properties for caching
  fmCachePath: string;
  fmCacheModifiedTime: number;

  // Front matter fields
  fmFolder: string;
  fmFilePath: string;
  fmRelFileWsPath: string;
  fmRelFilePath: string;
  fmFileName: string;
  fmModified: number;
  fmPublished: number | null | undefined;
  fmDraft: 'Draft' | 'Published';
  fmYear: number | null | undefined;
  fmPreviewImage: string;
  fmTags: string[];
  fmCategories: string[];
  fmContentType: string;
  fmDateFormat: string | undefined;

  // i18n fields
  fmDefaultLocale?: boolean;
  fmLocale?: I18nConfig;
  fmTranslations?: { 
    [locale: string]: {
      locale: I18nConfig;
      path: string;
    }
  };

  title: string;
  slug: string;
  date: string | Date;
  draft: boolean | string;
  description: string;

  preview?: string;
  [prop: string]: any;
}
