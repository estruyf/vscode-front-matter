import { Combobox, Transition } from '@headlessui/react';
import * as React from 'react';
import { BaseFieldProps } from '../../../models';
import { Fragment, useCallback, useEffect, useMemo } from 'react';
import { Page } from '../../../dashboardWebView/models';
import { messageHandler } from '@estruyf/vscode/dist/client/webview';
import { CommandToCode } from '../../CommandToCode';
import { ChevronDownIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { FieldTitle } from './FieldTitle';
import { FieldMessage } from './FieldMessage';
import { ChoiceButton } from './ChoiceButton';
import useDropdownStyle from '../../hooks/useDropdownStyle';
import useMessages from '../../hooks/useMessages';

export interface IContentTypeRelationshipFieldProps extends BaseFieldProps<string | string[]> {
  contentTypeName?: string;
  contentTypeValue?: string;
  sameContentLocale?: boolean;
  multiSelect?: boolean;
  onChange: (value: string | string[]) => void;
}

export const ContentTypeRelationshipField: React.FunctionComponent<
  IContentTypeRelationshipFieldProps
> = ({
  label,
  description,
  value,
  contentTypeName,
  contentTypeValue,
  sameContentLocale,
  multiSelect,
  onChange,
  required
}: React.PropsWithChildren<IContentTypeRelationshipFieldProps>) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [choices, setChoices] = React.useState<string[]>([]);
  const [pages, setPages] = React.useState<Page[]>([]);
  const [crntSelected, setCrntSelected] = React.useState<string | string[] | null>(value);
  const [filter, setFilter] = React.useState<string | undefined>(undefined);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const { getDropdownStyle } = useDropdownStyle(inputRef as any, '6px');
  const { metadata } = useMessages();

  /**
   * Check the required state
   */
  const showRequiredState = useMemo(() => {
    return (
      required && ((crntSelected instanceof Array && crntSelected.length === 0) || !crntSelected)
    );
  }, [required, crntSelected]);

  /**
   * Retrieve the value based on the field setting
   * @param value
   * @param type
   * @returns
   */
  const getValue = (value: Page, type: string = 'path') => {
    if (type === 'path') {
      return value.fmRelFilePath || value.fmFilePath;
    }

    return `${value[type]}`;
  };

  /**
   * Retrieve choice value to display
   */
  const getChoiceValue = useCallback(
    (value: string) => {
      const choice = pages.find((p: Page) => getValue(p, contentTypeValue) === value);

      if (choice) {
        return choice.title;
      }
      return '';
    },
    [pages, choices, contentTypeValue]
  );

  /**
   * On selecting an option
   * @param txtValue
   */
  const onSelect = (option: string) => {
    setFilter(undefined);

    if (multiSelect) {
      if (option) {
        const crntValue = typeof crntSelected === 'string' ? [crntSelected] : crntSelected;
        const newValue = [...((crntValue || []) as string[]), option];
        const uniqueValues = [...new Set(newValue)];
        setCrntSelected(uniqueValues);
        onChange(uniqueValues);
      }
    } else if (option) {
      setCrntSelected(option);
      onChange(option);
    }
  };

  /**
   * Remove a selected value
   * @param txtValue
   */
  const removeSelected = useCallback(
    (txtValue: string) => {
      if (multiSelect) {
        const newValue = [...(crntSelected || [])].filter((v) => v !== txtValue);
        setCrntSelected(newValue);
        onChange(newValue);
      } else {
        setCrntSelected('');
        onChange('');
      }
    },
    [multiSelect, crntSelected, onChange]
  );

  /**
   * Retrieve the available choices
   */
  const availableChoices = useMemo(() => {
    return pages.filter((page: Page) => {
      const value = contentTypeValue === 'slug' ? page.slug : page.fmFilePath;

      let toShow = true;

      if (typeof crntSelected === 'string') {
        toShow = crntSelected !== `${value}` && !value.includes(crntSelected);
      } else if (crntSelected instanceof Array) {
        const selected = crntSelected.filter((v) => v === `${value}` || value.includes(v));
        toShow = selected.length === 0;
      }

      if (toShow && filter) {
        return page.title.toLowerCase().includes(filter);
      }

      return toShow;
    });
  }, [choices, crntSelected, multiSelect, contentTypeValue, filter]);

  /**
   * Retrieve the selected value
   */
  useEffect(() => {
    if (crntSelected !== value) {
      setCrntSelected(value);
    }
  }, [value]);

  /**
   * Retrieve the pages based on the content type
   */
  useEffect(() => {
    if (contentTypeName && metadata?.filePath) {
      setLoading(true);
      messageHandler
        .request<Page[]>(CommandToCode.searchByType, {
          type: contentTypeName,
          sameLocale: sameContentLocale ?? true,
          activePath: metadata?.filePath
        })
        .then((pages: Page[]) => {
          setPages(pages || []);
          setChoices((pages || []).map((page) => page.title));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [contentTypeName, sameContentLocale, metadata?.filePath]);

  return (
    <div className={`metadata_field ${showRequiredState ? 'required' : ''}`}>
      <FieldTitle label={label} icon={<DocumentPlusIcon />} required={required} />

      {loading ? (
        <div className="metadata_field__wrapper">
          <div className="metadata_field__loading">
            {l10n.t(LocalizationKey.panelFieldsContentTypeRelationshipFieldLoading)}
          </div>
        </div>
      ) : (
        <Combobox value={crntSelected} onChange={onSelect}>
          {({ open }) => (
            <div className="relative">
              <div className="relative w-full cursor-default overflow-hidden rounded border border-solid border-[var(--vscode-inputValidation-infoBorder)] text-left focus:outline-none">
                <Combobox.Input
                  className="w-full border-none py-2 pl-3 pr-10 leading-5 text-[var(--vscode-input-foreground)] focus:ring-0"
                  onChange={(e) => setFilter(e.target.value)}
                  value={filter || ''}
                  placeholder={l10n.t(LocalizationKey.panelFieldsChoiceFieldSelect, label)}
                  ref={inputRef}
                />

                <Combobox.Button className="absolute inset-y-0 right-0 flex w-8 items-center rounded-none bg-inherit text-[var(--vscode-input-foreground)] hover:text-[var(--vscode-button-foreground)]">
                  <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                </Combobox.Button>
              </div>

              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                afterLeave={() => setFilter('')}
              >
                <Combobox.Options
                  className="field_dropdown absolute z-50 max-h-60 w-full space-y-1 overflow-auto border border-solid border-[var(--vscode-dropdown-border)] bg-[var(--vscode-dropdown-background)] px-0 py-1 text-base text-[var(--vscode-dropdown-foreground)] shadow-lg focus:outline-none"
                  style={{
                    bottom: getDropdownStyle(open)
                  }}
                >
                  {availableChoices.map((choice) => (
                    <Combobox.Option
                      key={choice.fmFilePath}
                      value={getValue(choice, contentTypeValue)}
                      className={({ active }) =>
                        `cursor-pointer list-none px-[var(--input-padding-horizontal)] py-[var(--input-padding-vertical)] hover:bg-[var(--vscode-button-hoverBackground)] hover:text-[var(--vscode-button-foreground)] ${
                          active
                            ? 'bg-[var(--vscode-button-hoverBackground)] text-[var(--vscode-button-foreground)] '
                            : ''
                        }`
                      }
                    >
                      {choice.title}
                      <div className="mt-0.5 text-xs opacity-60">{choice.slug}</div>
                    </Combobox.Option>
                  ))}

                  {availableChoices.length === 0 ? (
                    <div className="relative cursor-default select-none text-center">
                      {l10n.t(LocalizationKey.commonNoResults)}
                    </div>
                  ) : null}
                </Combobox.Options>
              </Transition>
            </div>
          )}
        </Combobox>
      )}

      <FieldMessage
        name={label.toLowerCase()}
        description={description}
        showRequired={showRequiredState}
      />

      {pages.length > 0 &&
        (crntSelected instanceof Array
          ? crntSelected.map((value: string) => (
              <ChoiceButton
                key={value}
                value={value}
                className="mr-0 flex w-full justify-between"
                title={getChoiceValue(value)}
                onClick={removeSelected}
              />
            ))
          : crntSelected && (
              <ChoiceButton
                key={crntSelected}
                value={crntSelected}
                className="mr-0 flex w-full justify-between"
                title={getChoiceValue(crntSelected)}
                onClick={removeSelected}
              />
            ))}
    </div>
  );
};
