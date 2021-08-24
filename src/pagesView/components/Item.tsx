import * as React from 'react';
import { MessageHelper } from '../../helpers/MessageHelper';
import { DashboardMessage } from '../DashboardMessage';
import { Page } from '../models/Page';
import { DateField } from './DateField';
import { Status } from './Status';

export interface IItemProps extends Page {}

export const Item: React.FunctionComponent<IItemProps> = ({ fmFilePath, date, title, draft, description, preview }: React.PropsWithChildren<IItemProps>) => {
  
  const openFile = () => {
    MessageHelper.sendMessage(DashboardMessage.openFile, fmFilePath);
  };

  return (
    <li className="relative">
      <button className={`group cursor-pointer flex flex-wrap items-start content-start h-full w-full rounded-lg bg-gray-50 text-vulcan-500 text-left overflow-hidden shadow-md hover:shadow-xl`}
              onClick={openFile}>
        <div className="relative h-36 w-full overflow-hidden">
          {
            preview ? (
              <img src={`${preview}`} alt={title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            ) : (
              <img src={`https://images.unsplash.com/photo-1598620617148-c9e8ddee6711?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80`} alt={title} className="absolute inset-0 h-full w-full object-cover group-hover:opacity-95" loading="lazy" />
            )
          }
        </div>

        <div className="p-4">
          <div className={`flex justify-between items-center`}>
            <Status draft={!!draft} />

            <DateField value={date} />
          </div>

          <h2 className="mt-2 mb-2 font-bold">{title}</h2>

          <p className="text-xs text-vulcan-200">{description}</p>
        </div>
      </button>
    </li>
  );
};
