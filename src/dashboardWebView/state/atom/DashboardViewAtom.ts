import { atom } from 'recoil';

export const DashboardViewAtom = atom<"contents" | "media">({
  key: 'DashboardViewAtom',
  default: "contents"
});