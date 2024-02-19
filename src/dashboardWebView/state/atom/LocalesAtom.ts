import { atom } from 'recoil';
import { I18nConfig } from '../../../models';

export const LocalesAtom = atom<I18nConfig[] | undefined>({
  key: 'LocalesAtom',
  default: undefined
});
