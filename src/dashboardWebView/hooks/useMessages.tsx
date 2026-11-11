import { useState, useEffect, useRef } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { DashboardCommand } from '../DashboardCommand';
import { DashboardMessage } from '../DashboardMessage';
import { Page } from '../models/Page';
import {
  DashboardViewAtom,
  LoadingAtom,
  SettingsAtom,
  ViewDataAtom,
  SearchReadyAtom,
  ModeAtom,
  GroupingAtom,
  FolderAtom,
  FiltersAtom,
  TagAtom,
  CategoryAtom
} from '../state';
import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import { EventData } from '@estruyf/vscode/dist/models';
import { NavigationType } from '../models';
import { GeneralCommands } from '../../constants';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '..';
import { GroupOption } from '../constants/GroupOption';

export default function useMessages() {
  const navigate = useNavigate();
  const [loading, setLoading] = useRecoilState(LoadingAtom);
  const [pages, setPages] = useState<Page[]>([]);
  const [settings, setSettings] = useRecoilState(SettingsAtom);
  const [viewData, setViewData] = useRecoilState(ViewDataAtom);
  const setMode = useSetRecoilState(ModeAtom);
  const setView = useSetRecoilState(DashboardViewAtom);
  const setSearchReady = useSetRecoilState(SearchReadyAtom);
  const setGrouping = useSetRecoilState(GroupingAtom);
  const setFolder = useSetRecoilState(FolderAtom);
  const setFilters = useSetRecoilState(FiltersAtom);
  const setTag = useSetRecoilState(TagAtom);
  const setCategory = useSetRecoilState(CategoryAtom);
  const defaultsApplied = useRef(false);

  const messageListener = (event: MessageEvent<EventData<any>>) => {
    const message = event.data;

    messageHandler.send(GeneralCommands.toVSCode.logging.verbose, {
      message: `Message received: ${message.command}`,
      location: 'DASHBOARD'
    });

    switch (message.command) {
      case DashboardCommand.loading:
        setLoading(message.payload);
        break;
      case DashboardCommand.viewData:
        setViewData(message.payload);
        if (message.payload?.type === NavigationType.Media) {
          setView(NavigationType.Media);
          navigate(routePaths[NavigationType.Media]);
        } else if (message.payload?.type === NavigationType.Contents) {
          setView(NavigationType.Contents);
          navigate(routePaths[NavigationType.Contents]);
        } else if (message.payload?.type === NavigationType.Data) {
          setView(NavigationType.Data);
          navigate(routePaths[NavigationType.Data]);
        } else if (message.payload?.type === NavigationType.Taxonomy) {
          setView(NavigationType.Taxonomy);
          navigate(routePaths[NavigationType.Taxonomy]);
        } else if (message.payload?.type === NavigationType.Snippets) {
          setView(NavigationType.Snippets);
          navigate(routePaths[NavigationType.Snippets]);
        }
        break;
      case DashboardCommand.settings:
        setSettings(message.payload);
        if (!defaultsApplied.current) {
          defaultsApplied.current = true;
          const defaults = message.payload?.dashboardState?.contents?.defaults;
          if (defaults) {
            if (defaults.grouping) {
              const GROUPING_MAP: { [key: string]: GroupOption } = {
                Year: GroupOption.Year,
                Draft: GroupOption.Draft,
                None: GroupOption.none
              };
              setGrouping(GROUPING_MAP[defaults.grouping] ?? (defaults.grouping as any));
            }
            if (defaults.filters) {
              const { contentFolders, tags, categories, ...customFilters } = defaults.filters;
              if (contentFolders) {
                setFolder(contentFolders);
              }
              if (tags) {
                setTag(tags);
              }
              if (categories) {
                setCategory(categories);
              }
              if (Object.keys(customFilters).length > 0) {
                setFilters(customFilters);
              }
            }
          }
        }
        break;
      case DashboardCommand.pages:
        setPages(message.payload);
        setLoading(undefined);
        break;
      case DashboardCommand.searchReady:
        setSearchReady(true);
        break;
      case GeneralCommands.toWebview.setMode:
        setMode(message.payload);
        break;
    }
  };

  useEffect(() => {
    Messenger.listen(messageListener);

    setLoading("loading");
    Messenger.send(DashboardMessage.getViewType);
    Messenger.send(DashboardMessage.getTheme);
    Messenger.send(DashboardMessage.getData);
    Messenger.send(DashboardMessage.getMode);

    return () => {
      Messenger.unlisten(messageListener);
    };
  }, []);

  return {
    loading,
    pages,
    viewData,
    settings
  };
}
