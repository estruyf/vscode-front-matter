import { atom } from 'recoil';

export enum ViewType {
  Grid = 1,
  List
}

export const ViewAtom = atom<ViewType>({
  key: 'ViewAtom',
  default: ViewType.Grid
});