import { useMemo } from 'react';
import { MediaInfo } from '../../models';
import { dirname } from 'path';
import { useRecoilValue } from 'recoil';
import { SettingsSelector } from '../state';
import { parseWinPath } from '../../helpers/parseWinPath';

export default function useMediaInfo(media?: MediaInfo) {
  const settings = useRecoilValue(SettingsSelector);

  const mediaFolder = useMemo(() => {
    if (settings?.wsFolder && media?.fsPath) {
      let relPath = media.fsPath.split(settings.wsFolder).pop();

      if (settings.staticFolder && relPath) {
        relPath = relPath.split(settings.staticFolder).pop();
      }

      return dirname(parseWinPath(relPath) || '');
    }
    return '';
  }, [media?.fsPath, settings?.staticFolder, settings?.wsFolder]);

  const mediaSize = useMemo(() => {
    if (media?.size) {
      const size = media.size / (1024 * 1024);
      if (size > 1) {
        return `${size.toFixed(2)} MB`;
      } else {
        return `${(size * 1024).toFixed(2)} KB`;
      }
    }

    return '';
  }, [media]);

  const mediaDimensions = useMemo(() => {
    if (media?.dimensions) {
      return `${media.dimensions.width} x ${media.dimensions.height}`;
    }
    return '';
  }, [media]);

  const mediaDetails = useMemo(() => {
    let sizeDetails = [];

    if (mediaDimensions) {
      sizeDetails.push(mediaDimensions);
    }

    if (mediaSize) {
      sizeDetails.push(mediaSize);
    }

    return sizeDetails.join(' - ');
  }, [mediaDimensions, mediaSize]);

  const isVideo = useMemo(() => {
    if (media?.mimeType?.startsWith('video/')) {
      return true;
    }
    return false;
  }, [media]);

  const isAudio = useMemo(() => {
    if (media?.mimeType?.startsWith('audio/')) {
      return true;
    }
    return false;
  }, [media]);

  const isImage = useMemo(() => {
    if (
      media?.mimeType?.startsWith('image/') &&
      !media?.mimeType?.startsWith('image/vnd.adobe.photoshop')
    ) {
      return true;
    }
    return false;
  }, [media]);

  return {
    mediaFolder,
    mediaSize,
    mediaDimensions,
    mediaDetails,
    isVideo,
    isAudio,
    isImage
  };
}