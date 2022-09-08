import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { MediaTotalSelector, PageAtom } from '../../state';
import { PAGE_LIMIT } from './Pagination';

export interface IPaginationStatusProps {}

export const PaginationStatus: React.FunctionComponent<IPaginationStatusProps> = (props: React.PropsWithChildren<IPaginationStatusProps>) => {
  const totalMedia = useRecoilValue(MediaTotalSelector);
  const page = useRecoilValue(PageAtom);

  const getTotalPage = () => {
    const mediaItems = ((page + 1) * PAGE_LIMIT);
    if (totalMedia < mediaItems) {
      return totalMedia;
    }
    return mediaItems;
  };

  return (
    <div className="hidden sm:flex">      
      <p className="text-sm text-gray-500 dark:text-whisper-900">
        Showing <span className="font-medium">{(page * PAGE_LIMIT) + 1}</span> to <span className="font-medium">{getTotalPage()}</span> of{' '}
        <span className="font-medium">{totalMedia}</span> results
      </p>
    </div>
  );
};