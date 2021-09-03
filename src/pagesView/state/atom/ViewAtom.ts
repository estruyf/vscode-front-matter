import { atom } from 'recoil';
import { STORAGE_VIEW_TYPE } from '../../constants/Storage';

export enum ViewType {
  Grid = 1,
  List
}

const defaultView: number = parseInt(window.localStorage.getItem(STORAGE_VIEW_TYPE) as string);

export const ViewAtom = atom<ViewType>({
  key: 'ViewAtom',
  default: isNaN(defaultView) ? ViewType.Grid : defaultView
});