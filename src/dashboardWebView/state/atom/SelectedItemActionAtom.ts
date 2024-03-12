import { atom } from 'recoil';

export const SelectedItemActionAtom = atom<
  | {
      path: string;
      action: 'view' | 'edit';
    }
  | undefined
>({
  key: 'SelectedItemActionAtom',
  default: undefined
});
