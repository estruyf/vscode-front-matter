import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { GroupOption } from '../../constants/GroupOption';
import { AllPagesAtom, GroupingAtom, SettingsAtom } from '../../state';
import { MenuButton, MenuItem } from '../Menu';
import { LocalizationKey, localize } from '../../../localization';
import { DropdownMenu, DropdownMenuContent } from '../../../components/shadcn/Dropdown';

export interface IGroupingProps { }

export const Grouping: React.FunctionComponent<
  IGroupingProps
> = () => {
  const settings = useRecoilValue(SettingsAtom);
  const [group, setGroup] = useRecoilState(GroupingAtom);
  const pages = useRecoilValue(AllPagesAtom);

  const GROUP_OPTIONS = React.useMemo(() => {
    const options: { name: string, id?: GroupOption | string }[] = [];

    if (pages.length > 0) {
      if (settings?.grouping) {
        const groups = settings.grouping.map((g) => ({ name: g.title, id: g.name }));
        options.push(...groups);
      }

      if (pages.some((x) => x.fmYear)) {
        options.push({ name: localize(LocalizationKey.dashboardHeaderGroupingOptionYear), id: GroupOption.Year })
      }

      if (pages.some((x) => x.fmDraft)) {
        options.push({ name: localize(LocalizationKey.dashboardHeaderGroupingOptionDraft), id: GroupOption.Draft })
      }
    }

    if (options.length > 0) {
      options.unshift({ name: localize(LocalizationKey.dashboardHeaderGroupingOptionNone), id: GroupOption.none })
    }

    return options;
  }, [pages, settings?.grouping])

  const crntGroup = GROUP_OPTIONS.find((x) => x.id === group);

  if (GROUP_OPTIONS.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <MenuButton label={localize(LocalizationKey.dashboardHeaderGroupingMenuButtonLabel)} title={crntGroup?.name || ''} />

      <DropdownMenuContent>
        {GROUP_OPTIONS.map((option) => (
          <MenuItem
            key={option.id}
            title={option.name}
            value={option.id}
            isCurrent={option.id === crntGroup?.id}
            onClick={(value) => setGroup(value)}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
