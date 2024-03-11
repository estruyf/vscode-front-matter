import { atom } from 'recoil';

export const SelectedItemActionAtom = atom<
  | {
      path: string;
      action: 'edit';
    }
  | undefined
>({
  key: 'SelectedItemActionAtom',
  default: undefined
});
