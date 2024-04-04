import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { SelectedItemActionAtom } from '../../state';
import { MediaInfo } from '../../../models';
import { DetailsSlideOver } from './DetailsSlideOver';
import useMediaInfo from '../../hooks/useMediaInfo';

export interface IMediaItemPanelProps {
  allMedia: MediaInfo[];
}

export const MediaItemPanel: React.FunctionComponent<IMediaItemPanelProps> = ({ allMedia }: React.PropsWithChildren<IMediaItemPanelProps>) => {
  const [crntPath, setCrntPath] = useState<string>('');
  const [media, setMedia] = useState<MediaInfo | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItemAction, setSelectedItemAction] = useRecoilState(SelectedItemActionAtom);
  const { mediaFolder, mediaSize, mediaDimensions, isImage, isVideo } = useMediaInfo(media);

  const onDismiss = () => {
    setShowDetails(false);
    setShowForm(false);
    setMedia(undefined);
  };

  useEffect(() => {
    if (selectedItemAction && selectedItemAction.path) {
      const mediaFile = allMedia.find((m) => m.fsPath === selectedItemAction.path);
      setMedia(mediaFile);
      setCrntPath(selectedItemAction.path);

      if (selectedItemAction.action === 'edit') {
        setShowForm(true);
        setShowDetails(true);
      } else if (selectedItemAction.action === 'view') {
        setShowForm(false);
        setShowDetails(true);
      }

      setSelectedItemAction(undefined);
    } else if (crntPath) {
      const mediaFile = allMedia.find((m) => m.fsPath === crntPath);
      setMedia(mediaFile);
    }
  }, [allMedia, selectedItemAction, crntPath]);

  if (showDetails && media) {
    return (
      <DetailsSlideOver
        imgSrc={media.vsPath || ''}
        size={mediaSize}
        dimensions={mediaDimensions}
        folder={mediaFolder}
        media={media}
        showForm={showForm}
        isImageFile={isImage}
        isVideoFile={isVideo}
        onEdit={() => setShowForm(true)}
        onEditClose={() => setShowForm(false)}
        onDismiss={onDismiss}
      />
    );
  }

  return null;
};