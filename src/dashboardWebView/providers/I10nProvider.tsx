import * as React from 'react';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { GeneralCommands } from '../../constants';
import * as l10n from '@vscode/l10n';

interface I10nProviderProps { }

const I10nContext = React.createContext<I10nProviderProps | undefined>(undefined);

const I10nProvider: React.FunctionComponent<I10nProviderProps> = ({ children }: React.PropsWithChildren<I10nProviderProps>) => {
  const [localeReady, setLocaleReady] = React.useState<boolean>(false);

  React.useEffect(() => {
    messageHandler.request<any>(GeneralCommands.toVSCode.getLocalization).then((contents) => {
      if (contents) {
        l10n.config({
          contents
        });

        setTimeout(() => {
          setLocaleReady(true);
        }, 0);
      }
    }).catch(() => {
      setLocaleReady(false);
      throw new Error('Error getting localization');
    });
  }, []);

  return (
    <I10nContext.Provider value={{}}>
      {
        localeReady && children
      }
    </I10nContext.Provider>
  )
};

const useI10nContext = (): I10nProviderProps => {
  const loadFunc = React.useContext(I10nContext);

  if (loadFunc === undefined) {
    throw new Error('useI10nContext must be used within the I10nProvider');
  }

  return loadFunc;
};

I10nContext.displayName = 'I10nContext';
I10nProvider.displayName = 'I10nProvider';

export { I10nProvider, useI10nContext };
