import { atom } from 'recoil';
import { Page } from '../../models';

export const AllPagesAtom = atom<Page[]>({
  key: 'AllPagesAtom',
  default: []
});
