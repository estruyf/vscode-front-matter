import { atom } from 'recoil';

export const DEFAULT_TAG_STATE = "";

export const TagAtom = atom<string | null>({
  key: 'TagAtom',
  default: DEFAULT_TAG_STATE
});