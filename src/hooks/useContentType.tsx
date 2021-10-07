import { useState, useEffect } from 'react';
import { DEFAULT_CONTENT_TYPE, DEFAULT_CONTENT_TYPE_NAME } from '../constants/ContentType';
import { Settings } from '../dashboardWebView/models';
import { ContentType, PanelSettings } from '../models';

export default function useContentType(settings: PanelSettings | Settings | undefined | null, metadata: any) {
  const [contentType, setContentType] = useState<ContentType>(DEFAULT_CONTENT_TYPE);

  useEffect(() => {
    if (settings) {
      const contentTypeName = metadata.type as string || DEFAULT_CONTENT_TYPE_NAME;
      let ct = settings.contentTypes.find(ct => ct.name === contentTypeName);

      if (!ct) {
        ct = settings.contentTypes.find(ct => ct.name === DEFAULT_CONTENT_TYPE_NAME);
      }

      if (!ct || !ct.fields) {
        ct = DEFAULT_CONTENT_TYPE;
      }

      setContentType(ct || DEFAULT_CONTENT_TYPE)
    }
  }, [settings?.contentTypes, metadata?.data]);

  return contentType;
}