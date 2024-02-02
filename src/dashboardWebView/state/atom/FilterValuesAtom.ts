import { atom } from 'recoil';

export const FilterValuesAtom = atom<{ [filter: string]: string[] }>({
  key: 'FilterValuesAtom',
  default: {}
});
