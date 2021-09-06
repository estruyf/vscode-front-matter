import { atom } from 'recoil';

export const DEFAULT_CATEGORY_STATE = "";

export const CategoryAtom = atom<string | null>({
  key: 'CategoryAtom',
  default: DEFAULT_CATEGORY_STATE
});