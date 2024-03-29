import { atom } from 'recoil';

export const SelectedItemActionAtom = atom<
  | {
      path: string;
      action: 'view' | 'edit' | 'delete';
    }
  | undefined
>({
  key: 'SelectedItemActionAtom',
  default: undefined
});
