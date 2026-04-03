import { atom } from 'recoil';

export const SelectedItemActionAtom = atom<
  | {
      path: string;
      action: 'view' | 'edit' | 'delete' | 'move';
    }
  | undefined
>({
  key: 'SelectedItemActionAtom',
  default: undefined
});
