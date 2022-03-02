import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { SettingsSelector } from '../../state';
import { PageLayout } from '../Layout/PageLayout';

export interface ISnippetsProps {}

export const Snippets: React.FunctionComponent<ISnippetsProps> = (props: React.PropsWithChildren<ISnippetsProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  
  return (
    <PageLayout>
      {
        JSON.stringify(settings?.snippets, null, 2)
      }
    </PageLayout>
  );
};