import { atom } from 'recoil';
import { GroupOption } from '../../constants/GroupOption';

export const GroupingAtom = atom<GroupOption>({
  key: 'GroupingAtom',
  default: GroupOption.none
});