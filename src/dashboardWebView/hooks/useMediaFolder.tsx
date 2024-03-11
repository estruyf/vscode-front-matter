import { useRecoilState } from 'recoil';
import { MultiSelectedItemsAtom, SelectedMediaFolderAtom } from '../state';

export default function useMediaFolder() {
  const [selectedFolder, setSelectedFolder] = useRecoilState(SelectedMediaFolderAtom);
  const [, setSelectedFiles] = useRecoilState(MultiSelectedItemsAtom);

  const updateFolder = (folder: string) => {
    setSelectedFolder(folder);
    setSelectedFiles([]);
  };

  return {
    selectedFolder,
    updateFolder
  };
}