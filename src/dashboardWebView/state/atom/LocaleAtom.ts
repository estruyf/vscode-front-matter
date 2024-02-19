import { atom } from 'recoil';

export const DEFAULT_LOCALE_STATE = '';

export const LocaleAtom = atom<string | null>({
  key: 'LocaleAtom',
  default: DEFAULT_LOCALE_STATE
});
