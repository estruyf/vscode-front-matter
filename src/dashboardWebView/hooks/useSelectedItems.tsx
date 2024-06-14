import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { MultiSelectedItemsAtom } from '../state';

export default function useSelectedItems() {
  const [selectedFiles, setSelectedFiles] = useRecoilState(MultiSelectedItemsAtom);

  const onMultiSelect = useCallback((filePath: string) => {
    if (selectedFiles.includes(filePath)) {
      setSelectedFiles(selectedFiles.filter((file) => file !== filePath));
    } else {
      setSelectedFiles([...selectedFiles, filePath]);
    }
  }, [selectedFiles]);

  return {
    selectedFiles,
    onMultiSelect
  };
}