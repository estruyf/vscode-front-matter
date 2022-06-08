import { EventData } from '@estruyf/vscode';
import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useEffect } from 'react';
import { TelemetryEvent } from '../../../constants';
import { DashboardCommand } from '../../DashboardCommand';
import { DashboardMessage } from '../../DashboardMessage';
import { Page } from '../../models';
import { PageLayout } from '../Layout/PageLayout';

export interface ITaxonomyViewProps {
  pages: Page[];
}

export const TaxonomyView: React.FunctionComponent<ITaxonomyViewProps> = ({ pages }: React.PropsWithChildren<ITaxonomyViewProps>) => {
  
  const messageListener = (message: MessageEvent<EventData<any>>) => {
    const { command, data } = message.data;

    if (command === DashboardCommand.setTaxonomyData) {
      console.log('TaxonomyView: setTaxonomyData', data);
    }
  };

  useEffect(() => {
    Messenger.send(DashboardMessage.sendTelemetry, {
      event: TelemetryEvent.webviewTaxonomyDashboard
    });
    
    Messenger.send(DashboardMessage.getTaxonomyData);

    Messenger.listen(messageListener);

    return () => {
      Messenger.unlisten(messageListener);
    }
  }, []);

  return (
    <PageLayout>
      {pages.length}
    </PageLayout>
  );
};