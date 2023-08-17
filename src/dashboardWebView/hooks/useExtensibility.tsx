import { useState, useEffect } from 'react';
import { useSettingsContext } from '../providers/SettingsProvider';

export default function useExtensibility(options: {
  fmFilePath: string;
  date: string | Date;
  title: string;
  description: string;
  type: string;
  pageData: any;
}) {
  const { webviewUrl } = useSettingsContext();
  const [titleHtml, setTitleHtml] = useState<string | undefined>(undefined);
  const [descriptionHtml, setDescriptionHtml] = useState<string | undefined>(undefined);
  const [statusHtml, setStatusHtml] = useState<string | undefined>(undefined);
  const [dateHtml, setDateHtml] = useState<string | undefined>(undefined);
  const [tagsHtml, setTagsHtml] = useState<string | undefined>(undefined);
  const [imageHtml, setImageHtml] = useState<string | undefined>(undefined);
  const [footerHtml, setFooterHtml] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!window.fmExternal || !options || !options.fmFilePath) {
      return;
    }

    if (window.fmExternal.getCardFooter) {
      window.fmExternal.getCardFooter(options.fmFilePath, {
        fmFilePath: options.fmFilePath,
        date: options.date,
        title: options.title,
        description: options.description,
        type: options.type,
        ...options.pageData
      }).then(htmlContent => {
        if (htmlContent) {
          setFooterHtml(htmlContent);
        } else {
          setFooterHtml(undefined);
        }
      });
    }

    if (window.fmExternal.getCardImage) {
      window.fmExternal.getCardImage(options.fmFilePath, {
        fmFilePath: options.fmFilePath,
        fmWebviewUrl: webviewUrl,
        date: options.date,
        title: options.title,
        description: options.description,
        type: options.type,
        ...options.pageData
      }).then(htmlContent => {
        if (htmlContent) {
          setImageHtml(htmlContent);
        } else {
          setImageHtml(undefined);
        }
      });
    }

    if (window.fmExternal.getCardTitle) {
      window.fmExternal.getCardTitle(options.fmFilePath, {
        fmFilePath: options.fmFilePath,
        date: options.date,
        title: options.title,
        description: options.description,
        type: options.type,
        ...options.pageData
      }).then(htmlContent => {
        if (htmlContent) {
          setTitleHtml(htmlContent);
        } else {
          setTitleHtml(undefined);
        }
      });
    }

    if (window.fmExternal.getCardDescription) {
      window.fmExternal.getCardDescription(options.fmFilePath, {
        fmFilePath: options.fmFilePath,
        date: options.date,
        title: options.title,
        description: options.description,
        type: options.type,
        ...options.pageData
      }).then(htmlContent => {
        if (htmlContent) {
          setDescriptionHtml(htmlContent);
        } else {
          setDescriptionHtml(undefined);
        }
      });
    }

    if (window.fmExternal.getCardDate) {
      window.fmExternal.getCardDate(options.fmFilePath, {
        fmFilePath: options.fmFilePath,
        date: options.date,
        title: options.title,
        description: options.description,
        type: options.type,
        ...options.pageData
      }).then(htmlContent => {
        if (htmlContent) {
          setDateHtml(htmlContent);
        } else {
          setDateHtml(undefined);
        }
      });
    }

    if (window.fmExternal.getCardStatus) {
      window.fmExternal.getCardStatus(options.fmFilePath, {
        fmFilePath: options.fmFilePath,
        date: options.date,
        title: options.title,
        description: options.description,
        type: options.type,
        ...options.pageData
      }).then(htmlContent => {
        if (htmlContent) {
          setStatusHtml(htmlContent);
        } else {
          setStatusHtml(undefined);
        }
      });
    }

    if (window.fmExternal.getCardTags) {
      window.fmExternal.getCardTags(options.fmFilePath, {
        fmFilePath: options.fmFilePath,
        date: options.date,
        title: options.title,
        description: options.description,
        type: options.type,
        ...options.pageData
      }).then(htmlContent => {
        if (htmlContent) {
          setTagsHtml(htmlContent);
        } else {
          setTagsHtml(undefined);
        }
      });
    }
  }, [options]);

  return {
    titleHtml,
    descriptionHtml,
    statusHtml,
    dateHtml,
    tagsHtml,
    imageHtml,
    footerHtml
  };
}