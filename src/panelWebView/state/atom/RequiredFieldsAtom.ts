import { atom } from 'recoil';

export const RequiredFieldsAtom = atom<string[]>({
  key: 'RequiredFields',
  default: []
});
