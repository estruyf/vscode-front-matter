import { Combobox, Transition } from '@headlessui/react';
import * as React from 'react';
import { BaseFieldProps } from '../../../models';
import { Fragment, useEffect, useMemo } from 'react';
import { Page } from '../../../dashboardWebView/models';
import { messageHandler } from '@estruyf/vscode/dist/client/webview';
import { CommandToCode } from '../../CommandToCode';
import { ChevronDownIcon } from '@heroicons/react/outline';

export interface IComboboxFieldProps extends BaseFieldProps<string | string[]> {
  contentTypeName?: string;
  contentTypeValue?: string;
  multiSelect?: boolean;
  onChange: (value: string | string[]) => void;
}

export const ComboboxField: React.FunctionComponent<IComboboxFieldProps> = ({
  label,
  description,
  value,
  contentTypeName,
  contentTypeValue,
  multiSelect,
  onChange,
  required
}: React.PropsWithChildren<IComboboxFieldProps>) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [choices, setChoices] = React.useState<string[]>([]);
  const [pages, setPages] = React.useState<Page[]>([]);
  const [crntSelected, setCrntSelected] = React.useState<string | string[] | null>(value);

  const availableChoices = useMemo(() => {
    return pages.filter((page: Page) => {
      const value = contentTypeValue === "slug" ? page.slug : page.fmFilePath;

      if (typeof crntSelected === 'string') {
        return crntSelected !== `${value}` && !value.includes(crntSelected);
      } else if (crntSelected instanceof Array) {
        const selected = crntSelected.filter((v) => v === `${value}` || value.includes(v));
        return selected.length === 0;
      }

      return true;
    });
  }, [choices, crntSelected, multiSelect, contentTypeValue]);

  useEffect(() => {
    if (contentTypeName) {
      setLoading(true);
      messageHandler
        .request<Page[]>(CommandToCode.searchByType, contentTypeName)
        .then((pages: Page[]) => {
          setPages(pages || []);
          setChoices((pages || []).map(page => page.title))
        }).finally(() => {
          setLoading(false);
        });
    }
  }, [contentTypeName]);

  return (
    <Combobox
      value={crntSelected}
      onChange={(value) => null}
    >
      <div className="relative mt-1">

        <div className="relative w-full cursor-default overflow-hidden text-left focus:outline-none">
          <Combobox.Input
            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
            onChange={(e) => console.log(e)} />


          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2 w-8">
            <ChevronDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Combobox.Options
            className="absolute mt-1 max-h-60 w-full overflow-auto py-1 text-base focus:outline-none z-50 bg-black">
            {availableChoices.map((choice) => (
              <Combobox.Option key={choice.fmFilePath} value={choice.fmFileName}>
                {choice.title}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  )
};