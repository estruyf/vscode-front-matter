import * as React from 'react';
import { Header } from '../Header';
import { useRecoilValue } from 'recoil';
import { SettingsSelector } from '../../state';
import { DataForm } from './DataForm';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataFile } from '../../../models/DataFile';
import { messageHandler, Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { SponsorMsg } from '../Layout/SponsorMsg';
import { EventData } from '@estruyf/vscode';
import { DashboardCommand } from '../../DashboardCommand';
import { Button } from '../Common/Button';
import { arrayMoveImmutable } from 'array-move';
import { EmptyView } from './EmptyView';
import { Container } from './SortableContainer';
import { SortableItem } from './SortableItem';
import { ChevronRightIcon, CircleStackIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { DataType } from '../../../models/DataType';
import { GeneralCommands, WEBSITE_LINKS } from '../../../constants';
import { NavigationItem } from '../Layout';
import { LocalizationKey, localize } from '../../../localization';
import { DropdownMenu, DropdownMenuContent } from '../../../components/shadcn/Dropdown';
import { MenuButton, MenuItem } from '../Menu';
import { Transition } from '@headlessui/react';
import { DataFolder } from '../../../models';
import { ActionsBarItem } from '../Header/ActionsBarItem';
import { Spinner } from '../Common/Spinner';
import { openFile } from '../../utils/MessageHandlers';

export interface IDataViewProps { }

export const DataView: React.FunctionComponent<IDataViewProps> = (
  _: React.PropsWithChildren<IDataViewProps>
) => {
  const [selectedData, setSelectedData] = useState<DataFile | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dataEntries, setDataEntries] = useState<any | any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const settings = useRecoilValue(SettingsSelector);

  const setSchema = (dataFile: DataFile) => {
    setSelectedData(dataFile);
    setSelectedIndex(null);
    setDataEntries(null);

    Messenger.send(DashboardMessage.getDataEntries, { ...dataFile });
  };

  const messageListener = (message: MessageEvent<EventData<any>>) => {
    if (message.data.command === DashboardCommand.dataFileEntries) {
      setDataEntries(message.data.payload);
    }
  };

  const deleteItem = useCallback(
    (index: number) => {
      const dataClone: any[] = Object.assign([], dataEntries);

      if (!selectedData) {
        return;
      }

      dataClone.splice(index, 1);
      updateData(dataClone);
    },
    [selectedData, dataEntries]
  );

  const onSubmit = useCallback(
    (data: unknown) => {
      if (selectedData?.singleEntry) {
        // Needs to add a single entry
        updateData(data);
        return;
      }

      const dataClone: unknown[] = Object.assign([], dataEntries);
      if (selectedIndex !== null && selectedIndex !== undefined) {
        dataClone[selectedIndex] = data;
      } else {
        dataClone.push(data);
      }
      updateData(dataClone);
    },
    [selectedData, dataEntries, selectedIndex]
  );

  const onSortEnd = useCallback(
    ({ oldIndex, newIndex }: any) => {
      if (!dataEntries || dataEntries.length === 0) {
        return null;
      }

      if (selectedIndex !== null && selectedIndex !== undefined) {
        setSelectedIndex(newIndex);
      }

      const newEntries = arrayMoveImmutable(dataEntries, oldIndex, newIndex);
      updateData(newEntries);
    },
    [selectedData, dataEntries, selectedIndex]
  );

  const updateData = useCallback(
    (data: any) => {
      if (!selectedData) {
        return;
      }

      Messenger.send(DashboardMessage.putDataEntries, {
        file: selectedData.file,
        fileType: selectedData.fileType,
        entries: data
      });

      Messenger.send(DashboardMessage.showNotification, localize(LocalizationKey.dashboardDataViewDataViewUpdateMessage));
    },
    [selectedData]
  );

  const createDataFile = (folder: DataFolder) => {
    setLoading(true);
    messageHandler.request<DataFile>(DashboardMessage.createDataFile, folder).then(dataFile => {
      if (dataFile) {
        setSchema(dataFile);
      }
      setLoading(false);
    }).catch((_: any) => {
      setLoading(false);
    });
  }

  const dataEntry = useMemo(() => {
    if (selectedData?.singleEntry) {
      return dataEntries || {};
    }

    return dataEntries && selectedIndex !== null && selectedIndex !== undefined
      ? dataEntries[selectedIndex]
      : null;
  }, [selectedData, dataEntries, selectedIndex]);

  // Retrieve the data files, check if they have a schema or ID, if not, they shouldn't be shown
  const dataFiles = useMemo(() => {
    return (settings?.dataFiles || [])
      .map((dataFile: DataFile) => {
        if (!dataFile.schema && !dataFile.id) {
          return null;
        }

        const clonedFile = Object.assign({}, dataFile);

        if (clonedFile.type) {
          const dataType = settings?.dataTypes?.find(
            (dataType: DataType) => dataType.id === clonedFile.type
          );
          if (!dataType) {
            return null;
          }
          clonedFile.schema = Object.assign({}, dataType.schema);
        }

        return clonedFile;
      })
      .filter((d) => d !== null) as DataFile[];
  }, [settings?.dataFiles]);

  const fileCreationFolders = useMemo(() => {
    return (settings?.dataFolders || [])
      .filter((folder) => folder.enableFileCreation);
  }, [settings?.dataFolders]);

  const hasOnlyDataCreationFolders = useMemo(() => (!dataFiles || dataFiles.length === 0) && (fileCreationFolders && fileCreationFolders.length > 0), [dataFiles, fileCreationFolders]);

  useEffect(() => {
    Messenger.listen(messageListener);

    Messenger.send(DashboardMessage.setTitle, localize(LocalizationKey.dashboardHeaderTabsData));

    Messenger.send(GeneralCommands.toVSCode.logging.info, {
      message: 'Data view loaded',
      location: 'DASHBOARD'
    });

    return () => {
      Messenger.unlisten(messageListener);
    };
  }, []);

  console.log('DataView render', settings?.dataFolders);

  return (
    <div className="flex flex-col h-full overflow-auto inset-y-0">
      <Header settings={settings} />

      {(dataFiles && dataFiles.length > 0) || (fileCreationFolders && fileCreationFolders.length > 0) ? (
        <div className={`relative w-full flex-grow mx-auto overflow-hidden`}>
          {
            !selectedData && (dataFiles && dataFiles.length > 0) && (
              <div className={`flex w-64 flex-col absolute inset-y-0`}>
                <aside
                  className={`flex flex-col flex-grow overflow-y-auto border-r py-6 px-4 overflow-auto border-[var(--frontmatter-border)]`}
                >
                  <h2 className={`text-lg text-[var(--frontmatter-text)]`}>
                    {localize(LocalizationKey.dashboardDataViewDataViewSelect)}
                  </h2>

                  <nav className={`flex-1 py-4 -mx-4`}>
                    <div
                      className={`divide-y border-t border-b divide-[var(--frontmatter-border)] border-[var(--frontmatter-border)]`}
                    >

                      {dataFiles &&
                        dataFiles.length > 0 &&
                        dataFiles.map((dataFile, idx) => (
                          <NavigationItem
                            key={`${dataFile.id}-${idx}`}
                            onClick={() => setSchema(dataFile)}
                          >
                            <ChevronRightIcon className="-ml-1 w-5 mr-2" />
                            <span>{dataFile.title}</span>
                          </NavigationItem>
                        ))}
                    </div>
                  </nav>
                </aside>
              </div>
            )
          }

          <Transition
            as={`div`}
            show={!!selectedData}
            enter="transition ease transform"
            enterFrom="opacity-0"
            enterTo="opacity-100">
            <div className={`w-full px-4 py-2 border-b border-[var(--frontmatter-border)]`}>
              <div className={`flex justify-between`}>
                <div className={`flex gap-4`}>
                  {
                    selectedData && (
                      <DropdownMenu>
                        <MenuButton
                          label={localize(LocalizationKey.dashboardDataViewDataViewSelect)}
                          title={selectedData.title}
                        />

                        <DropdownMenuContent>
                          {dataFiles.map((dataFile) => (
                            <MenuItem
                              key={dataFile.id}
                              title={dataFile.title}
                              value={dataFile}
                              isCurrent={selectedData.id === dataFile.id}
                              onClick={() => setSchema(dataFile)}
                            />
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  }

                  {
                    fileCreationFolders && fileCreationFolders.length > 0 && (
                      <DropdownMenu>
                        <MenuButton
                          label={localize(LocalizationKey.dashboardDataViewDataViewCreateNew)}
                          title={localize(LocalizationKey.dashboardDataViewDataViewSelectDataFolder)}
                        />

                        <DropdownMenuContent>
                          {fileCreationFolders.map((folder) => (
                            <MenuItem
                              key={folder.id}
                              title={folder.id}
                              value={folder}
                              onClick={() => createDataFile(folder)}
                            />
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  }
                </div>

                {
                  selectedData && (
                    <div className={`flex gap-2`}>
                      <ActionsBarItem
                        className='flex items-center'
                        onClick={() => openFile(selectedData.file)}
                        title={localize(LocalizationKey.commonView)}
                      >
                        <EyeIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                        <span>{localize(LocalizationKey.commonView)}</span>
                      </ActionsBarItem>

                      <ActionsBarItem
                        className='flex items-center hover:text-[var(--vscode-statusBarItem-warningBackground)]'
                        onClick={() => setSelectedData(null)}
                        title={localize(LocalizationKey.dashboardDataViewDataViewCloseSelectedDataFile)}
                      >
                        <XMarkIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                        <span>{localize(LocalizationKey.dashboardDataViewDataViewCloseSelectedDataFile)}</span>
                      </ActionsBarItem>
                    </div>
                  )
                }
              </div>
            </div>
          </Transition>

          <section className={`flex min-w-0 h-full ease transition-[padding] ${selectedData ? "" : hasOnlyDataCreationFolders ? "" : "pl-64"}`}>
            {selectedData ? (
              <>
                {!selectedData.singleEntry && (
                  <div
                    className={`w-1/3 py-6 px-4 flex-1 border-r overflow-auto border-[var(--frontmatter-border)]`}
                  >
                    <h2 className={`text-lg text-[var(--frontmatter-text)]`}>
                      {localize(LocalizationKey.dashboardDataViewDataViewTitle, selectedData?.title?.toLowerCase() || '')}
                    </h2>

                    <div className="py-4">
                      {dataEntries && dataEntries.length > 0 ? (
                        <>
                          <Container onSortEnd={onSortEnd} useDragHandle>
                            {((dataEntries as any[]) || []).map((dataEntry, idx) => (
                              <SortableItem
                                key={dataEntry[selectedData.labelField] || `entry-${idx}`}
                                value={dataEntry[selectedData.labelField] || `Entry ${idx + 1}`}
                                index={idx}
                                crntIndex={idx}
                                selectedIndex={selectedIndex}
                                onSelectedIndexChange={(index: number) => setSelectedIndex(index)}
                                onDeleteItem={deleteItem}
                              />
                            ))}
                          </Container>
                          <Button className="mt-4" onClick={() => setSelectedIndex(null)}>
                            {localize(LocalizationKey.dashboardDataViewDataViewAdd)}
                          </Button>
                        </>
                      ) : (
                        <div className={`flex flex-col items-center justify-center`}>
                          <p className={`text-[var(--frontmatter-text)]`}>
                            {localize(LocalizationKey.dashboardDataViewDataViewEmpty, selectedData.title.toLowerCase())}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div
                  className={`${selectedData.singleEntry ? 'w-full' : 'w-2/3'
                    } py-6 px-4 overflow-auto`}
                >
                  <h2 className={`text-lg text-[var(--frontmatter-text)]`}>
                    {localize(LocalizationKey.dashboardDataViewDataViewCreateOrModify, selectedData.title.toLowerCase())}
                  </h2>
                  {selectedData ? (
                    <DataForm
                      schema={selectedData?.schema}
                      model={dataEntry}
                      onSubmit={onSubmit}
                      onClear={() => setSelectedIndex(null)}
                    />
                  ) : (
                    <p>{localize(LocalizationKey.dashboardDataViewDataViewGetStarted)}</p>
                  )}
                </div>
              </>
            ) : (
              <EmptyView
                folders={fileCreationFolders}
                onCreate={createDataFile} />
            )}
          </section>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className={`flex flex-col items-center text-[var(--frontmatter-text)]`}>
            <CircleStackIcon className="w-32 h-32" />
            <p className="text-3xl mt-2">{localize(LocalizationKey.dashboardDataViewDataViewNoDataFiles)}</p>
            <p className="text-xl mt-4">
              <a
                className={`text-[var(--frontmatter-link)] hover:text-[var(--frontmatter-link-hover)]`}
                href={WEBSITE_LINKS.docs.dataDashboard}
                title={localize(LocalizationKey.dashboardDataViewDataViewGetStartedLink)}
              >
                {localize(LocalizationKey.dashboardDataViewDataViewGetStartedLink)}
              </a>
            </p>
          </div>
        </div>
      )
      }

      {loading && <Spinner />}

      <SponsorMsg
        beta={settings?.beta}
        version={settings?.versionInfo}
        isBacker={settings?.isBacker}
      />

      <img className='hidden' src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Ffrontmatter.codes%2Fmetrics%2Fdashboards&slug=DataView" alt="DataView metrics" />
    </div >
  );
};
