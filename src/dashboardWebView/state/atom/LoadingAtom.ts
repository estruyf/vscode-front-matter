import { atom } from 'recoil';
import { LoadingType } from '../../../models';

export const LoadingAtom = atom<LoadingType>({
  key: 'LoadingAtom',
  default: undefined
});
