import * as React from 'react'

interface ISettingsProviderProps {
  version?: string;
  experimental?: boolean;
}

const SettingsContext = React.createContext<ISettingsProviderProps | undefined>(undefined);

const SettingsProvider: React.FunctionComponent<ISettingsProviderProps> = ({ version, experimental, children }: React.PropsWithChildren<ISettingsProviderProps>) => {
  const [ crntVersion, setCrntVersion ] = React.useState<string | undefined>(undefined);
  const [ crntExprimental, setCrntExprimental ] = React.useState<boolean>(false);

  React.useEffect(() => {
    setCrntVersion(version);
  }, [version]);

  React.useEffect(() => {
    setCrntExprimental(typeof experimental === 'boolean' ? experimental : false);
  }, [experimental]);

  return (
    <SettingsContext.Provider 
      value={{
        version: crntVersion,
        experimental: crntExprimental
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
};

const useSettingsContext = (): ISettingsProviderProps => {
  const loadFunc = React.useContext(SettingsContext);

  if (loadFunc === undefined) {
    throw new Error('useSettingsContext must be used within the SettingsProvider');
  }

  return loadFunc;
};

SettingsContext.displayName = 'SettingsContext';
SettingsProvider.displayName = 'SettingsProvider';

export { SettingsProvider, useSettingsContext };
