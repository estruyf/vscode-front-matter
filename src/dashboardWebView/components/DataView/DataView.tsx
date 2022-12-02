import * as React from 'react';
import { Header } from '../Header';
import { useRecoilValue } from 'recoil';
import { SettingsSelector } from '../../state';
import { DataForm } from './DataForm';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataFile } from '../../../models/DataFile';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { SponsorMsg } from '../SponsorMsg';
import { EventData } from '@estruyf/vscode';
import { DashboardCommand } from '../../DashboardCommand';
import { Button } from '../Button';
import { arrayMoveImmutable } from 'array-move';
import { EmptyView } from './EmptyView';
import { Container } from './SortableContainer';
import { SortableItem } from './SortableItem';
import { ChevronRightIcon, DatabaseIcon } from '@heroicons/react/outline';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataType } from '../../../models/DataType';
import { TelemetryEvent } from '../../../constants';
import { NavigationItem } from '../Layout';

export interface IDataViewProps {}

export const DataView: React.FunctionComponent<IDataViewProps> = (props: React.PropsWithChildren<IDataViewProps>) => {
  const [ selectedData, setSelectedData ] = useState<DataFile | null>(null);
  const [ selectedIndex, setSelectedIndex ] = useState<number | null>(null);
  const [ dataEntries, setDataEntries ] = useState<any | any[] | null>(null);
  const settings = useRecoilValue(SettingsSelector);

  const setSchema = (dataFile: DataFile) => {
    setSelectedData(dataFile);
    setSelectedIndex(null);
    setDataEntries(null);

    Messenger.send(DashboardMessage.getDataEntries, { ...dataFile });
  };

  const messageListener = (message: MessageEvent<EventData<any>>) => {
    if (message.data.command === DashboardCommand.dataFileEntries) {
      setDataEntries(message.data.data);
    }
  };

  const deleteItem = useCallback((index: number) => {
    const dataClone: any[] = Object.assign([], dataEntries);

    if (!selectedData) {
      return;
    }

    dataClone.splice(index, 1);
    updateData(dataClone);
  }, [selectedData, dataEntries]);

  
  const onSubmit = useCallback((data: any) => {
    if (selectedData?.singleEntry) {
      // Needs to add a single entry
      updateData(data);
      return;
    }

    const dataClone: any[] = Object.assign([], dataEntries);
    if (selectedIndex !== null && selectedIndex !== undefined) {
      dataClone[selectedIndex] = data;
    } else {
      dataClone.push(data);
    }
    updateData(dataClone);
  }, [selectedData, dataEntries, selectedIndex]);


  const onSortEnd = useCallback(({ oldIndex, newIndex }: any) => {
    if (!dataEntries || dataEntries.length === 0) {
      return null;
    }

    if (selectedIndex !== null && selectedIndex !== undefined) {
      setSelectedIndex(newIndex);
    }

    const newEntries = arrayMoveImmutable(dataEntries, oldIndex, newIndex);
    updateData(newEntries);
  }, [selectedData, dataEntries, selectedIndex]);

  const updateData = useCallback((data: any) => {
    if (!selectedData) {
      return;
    }

    Messenger.send(DashboardMessage.putDataEntries, {
      file: selectedData.file,
      fileType: selectedData.fileType,
      entries: data
    });

    // Show toast message
    toast.success("Updated your data entries", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      transition: Slide
    });
  }, [selectedData]);

  const dataEntry = useMemo(() => {
    if (selectedData?.singleEntry) {
      return dataEntries || {};
    }

    return (dataEntries && selectedIndex !== null && selectedIndex !== undefined) ? dataEntries[selectedIndex] : null;
  }, [selectedData, , dataEntries, selectedIndex]);

  useEffect(() => {
    Messenger.listen(messageListener);
    
    Messenger.send(DashboardMessage.sendTelemetry, {
      event: TelemetryEvent.webviewDataView
    });

    return () => {
      Messenger.unlisten(messageListener);
    }
  }, []);

  // Retrieve the data files, check if they have a schema or ID, if not, they shouldn't be shown
  const dataFiles = (settings?.dataFiles || []).map((dataFile: DataFile) => {
    if (!dataFile.schema && !dataFile.id) {
      return null;
    }

    const clonedFile = Object.assign({}, dataFile);

    if (clonedFile.type) {
      const dataType = settings?.dataTypes?.find((dataType: DataType) => dataType.id === clonedFile.type);
      if (!dataType) {
        return null;
      }
      clonedFile.schema = Object.assign({}, dataType.schema);
    }

    return clonedFile;
  }).filter(d => d !== null) as DataFile[];
  
  return (
    <div className="flex flex-col h-full overflow-auto inset-y-0">
      <Header settings={settings} />

      {
        (settings?.dataFiles && settings.dataFiles.length > 0) ? (
          <div className="relative w-full flex-grow mx-auto overflow-hidden">

            <div className={`flex w-64 flex-col absolute inset-y-0`}>

              <aside className={`flex flex-col flex-grow overflow-y-auto border-r border-gray-200 dark:border-vulcan-300  py-6 px-4 overflow-auto`}>
                <h2 className={`text-lg text-gray-500 dark:text-whisper-900`}>Select your data type</h2>

                <nav className={`flex-1 py-4 -mx-4 `}>
                  <div className={`divide-y divide-gray-200 dark:divide-vulcan-300 border-t border-b border-gray-200 dark:border-vulcan-300`}>
                    {
                      (dataFiles && dataFiles.length > 0) && (
                        dataFiles.map((dataFile, idx) => (
                          <NavigationItem
                            key={`${dataFile.id}-${idx}`}
                            isSelected={selectedData?.id === dataFile.id}
                            onClick={() => setSchema(dataFile)}>
                            <ChevronRightIcon className='-ml-1 w-5 mr-2' />
                            <span>{dataFile.title}</span>
                          </NavigationItem>
                        )
                      ))
                    }
                  </div>
                </nav>
              </aside>

            </div>

            <section className={`pl-64 flex min-w-0 h-full`}>
              {
                selectedData ? (
                  <>
                    {
                      !selectedData.singleEntry && (
                        <div className={`w-1/3 py-6 px-4 flex-1 border-r border-gray-200 dark:border-vulcan-300 overflow-auto`}>
                          <h2 className={`text-lg text-gray-500 dark:text-whisper-900`}>Your {selectedData?.title?.toLowerCase() || ""} data items</h2>

                          <div className='py-4'>
                            {
                              (dataEntries && dataEntries.length > 0) ? (
                                <>
                                  <Container onSortEnd={onSortEnd} useDragHandle>
                                    {
                                      (dataEntries as any[] || []).map((dataEntry, idx) => (
                                        <SortableItem 
                                          key={dataEntry[selectedData.labelField] || `entry-${idx}`}
                                          value={dataEntry[selectedData.labelField] || `Entry ${idx+1}`}
                                          index={idx}
                                          crntIndex={idx}
                                          selectedIndex={selectedIndex}
                                          onSelectedIndexChange={(index: number) => setSelectedIndex(index)}
                                          onDeleteItem={deleteItem}
                                          />
                                      ))
                                    }
                                  </Container>
                                  <Button
                                    className='mt-4'
                                    onClick={() => setSelectedIndex(null)}>
                                    Add a new entry
                                  </Button>
                                </>
                              ) : (
                                <div className={`flex flex-col items-center justify-center`}>
                                  <p className={`text-gray-500 dark:text-whisper-900`}>No {selectedData.title.toLowerCase()} data entries found</p>
                                </div>
                              )
                            }
                          </div>
                        </div>
                      )
                    }
                    <div className={`${selectedData.singleEntry ? "w-full" : "w-2/3"} py-6 px-4 overflow-auto`}>
                      <h2 className={`text-lg text-gray-500 dark:text-whisper-900`}>Create or modify your {selectedData.title.toLowerCase()} data</h2>
                      {
                        selectedData ? (
                          <DataForm 
                            schema={selectedData?.schema} 
                            model={dataEntry} 
                            onSubmit={onSubmit}
                            onClear={() => setSelectedIndex(null)} />
                        ) : (
                          <p>Select a data type to get started</p>
                        )
                      }
                    </div>
                  </>
                ) : (
                  <EmptyView />
                )
              }
            </section>
          </div>
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <div className='flex flex-col items-center text-gray-500 dark:text-whisper-900'>
              <DatabaseIcon className='w-32 h-32' />
              <p className='text-3xl mt-2'>No data files found</p>
              <p className='text-xl mt-4'>
                <a className={`text-teal-700 hover:text-teal-900`} href={`https://frontmatter.codes/docs/dashboard#data-files-view`} title={`Read more to get started using data files`}>Read more to get started using data files</a></p>
            </div>
          </div>
        )
      }

      <SponsorMsg beta={settings?.beta} version={settings?.versionInfo} isBacker={settings?.isBacker} />

      <ToastContainer />
    </div>
  );
};
