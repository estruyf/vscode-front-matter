import { useRecoilState, useSetRecoilState } from 'recoil';
import { MultiSelectedItemsAtom, SelectedMediaFolderAtom } from '../state';

export default function useMediaFolder() {
  const [selectedFolder, setSelectedFolder] = useRecoilState(SelectedMediaFolderAtom);
  const setSelectedFiles = useSetRecoilState(MultiSelectedItemsAtom);

  const updateFolder = (folder: string) => {
    setSelectedFolder(folder);
    setSelectedFiles([]);
  };

  return {
    selectedFolder,
    updateFolder
  };
}