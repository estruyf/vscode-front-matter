import * as React from 'react';
import { Page } from '../models';
import { MediaInfo } from '../../models';

interface IFilesProviderProps {
  files: Page[] | MediaInfo[];
}

const FilesContext = React.createContext<IFilesProviderProps | undefined>(undefined);

const FilesProvider: React.FunctionComponent<IFilesProviderProps> = ({ files, children }: React.PropsWithChildren<IFilesProviderProps>) => {
  return (
    <FilesContext.Provider
      value={{
        files
      }}
    >
      {children}
    </FilesContext.Provider>
  )
};

const useFilesContext = (): IFilesProviderProps => {
  const loadFunc = React.useContext(FilesContext);

  if (loadFunc === undefined) {
    throw new Error('useFilesContext must be used within the FilesProvider');
  }

  return loadFunc;
};

FilesContext.displayName = 'FilesContext';
FilesProvider.displayName = 'FilesProvider';

export { FilesProvider, useFilesContext };