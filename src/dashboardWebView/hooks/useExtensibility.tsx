import { useState, useEffect } from 'react';

export default function useExtensibility(options: {
  fmFilePath: string;
  date: string | Date;
  title: string;
  description: string;
  type: string;
  pageData: any;
}) {
  const [titleHtml, setTitleHtml] = useState<string | undefined>(undefined);
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
  }, [options]);

  return {
    titleHtml,
    imageHtml,
    footerHtml
  };
}