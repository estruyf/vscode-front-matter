import { useState, useEffect } from 'react';
import { DEFAULT_CONTENT_TYPE, DEFAULT_CONTENT_TYPE_NAME } from '../constants/ContentType';
import { Settings } from '../dashboardWebView/models';
import { ContentType, PanelSettings } from '../models';

export default function useContentType(
  settings: PanelSettings | Settings | undefined | null,
  metadata: any
) {
  const [contentType, setContentType] = useState<ContentType | null>(null);

  useEffect(() => {
    if (settings && metadata) {
      let contentTypeName = DEFAULT_CONTENT_TYPE_NAME;

      if (metadata?.type) {
        contentTypeName = metadata.type;
      }

      // Get the content type by the folder name
      const pageFolders = settings.contentFolders;
      let pageFolderMatches = pageFolders.filter((folder) => metadata.filePath.includes(folder.path));

      // Sort by longest path
      pageFolderMatches = pageFolderMatches.sort((a, b) => b.path.length - a.path.length);
      if (pageFolderMatches.length > 0 && pageFolderMatches[0].contentTypes && pageFolderMatches[0].contentTypes.length === 1) {
        contentTypeName = pageFolderMatches[0].contentTypes[0];
      }

      let ct = settings.contentTypes.find((ct) => ct.name === contentTypeName);

      if (!ct) {
        ct = settings.contentTypes.find((ct) => ct.name === DEFAULT_CONTENT_TYPE_NAME);
      }

      if (!ct || !ct.fields) {
        ct = DEFAULT_CONTENT_TYPE;
      }

      setContentType(ct || DEFAULT_CONTENT_TYPE);
    }
  }, [settings?.contentTypes, metadata?.type]);

  return contentType;
}
