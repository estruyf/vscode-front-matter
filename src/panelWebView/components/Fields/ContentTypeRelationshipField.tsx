import { ChevronDownIcon, DocumentAddIcon } from '@heroicons/react/outline';
import Downshift from 'downshift';
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { BaseFieldProps } from '../../../models';
import { ChoiceButton } from './ChoiceButton';
import { FieldTitle } from './FieldTitle';
import { FieldMessage } from './FieldMessage';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { CommandToCode } from '../../CommandToCode';
import { Page } from '../../../dashboardWebView/models';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IContentTypeRelationshipFieldProps extends BaseFieldProps<string | string[]> {
  contentTypeName?: string;
  contentTypeValue?: string;
  multiSelect?: boolean;
  onChange: (value: string | string[]) => void;
}

export const ContentTypeRelationshipField: React.FunctionComponent<IContentTypeRelationshipFieldProps> = ({
  label,
  description,
  value,
  contentTypeName,
  contentTypeValue,
  multiSelect,
  onChange,
  required
}: React.PropsWithChildren<IContentTypeRelationshipFieldProps>) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [choices, setChoices] = React.useState<string[]>([]);
  const [pages, setPages] = React.useState<Page[]>([]);
  const [crntSelected, setCrntSelected] = React.useState<string | string[] | null>(value);
  const dsRef = React.useRef<Downshift<string> | null>(null);

  const onValueChange = (txtValue: string) => {
    if (multiSelect) {
      const newValue = [...((crntSelected || []) as string[]), txtValue];
      setCrntSelected(newValue);
      onChange(newValue);
    } else {
      setCrntSelected(txtValue);
      onChange(txtValue);
    }
  };

  const removeSelected = (txtValue: string) => {
    if (multiSelect) {
      const newValue = [...(crntSelected || [])].filter((v) => v !== txtValue);
      setCrntSelected(newValue);
      onChange(newValue);
    } else {
      setCrntSelected('');
      onChange('');
    }
  };

  const getValue = (value: Page, type: string = "path") => {
    if (type === 'path') {
      return value.fmRelFilePath || value.fmFilePath;
    }

    return `${value[type]}`;
  };

  const getChoiceValue = React.useCallback((value: string) => {
    const choice = pages.find(
      (p: Page) => getValue(p, contentTypeValue) === value
    );

    if (choice) {
      return choice.title;
    }
    return '';
  }, [choices, contentTypeValue]);

  const availableChoices = useMemo(() => {
    return !multiSelect
      ? pages
      : pages.filter((page: Page) => {
        const value = page.fmFilePath;

        if (typeof crntSelected === 'string') {
          return crntSelected !== `${value}`;
        } else if (crntSelected instanceof Array) {
          return crntSelected.indexOf(`${value}`) === -1;
        }

        return true;
      });
  }, [choices, crntSelected, multiSelect]);

  const showRequiredState = useMemo(() => {
    return (
      required && ((crntSelected instanceof Array && crntSelected.length === 0) || !crntSelected)
    );
  }, [required, crntSelected]);

  useEffect(() => {
    if (crntSelected !== value) {
      setCrntSelected(value);
    }
  }, [value]);

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
    <div className={`metadata_field ${showRequiredState ? 'required' : ''}`}>
      <FieldTitle
        label={label}
        icon={<DocumentAddIcon />}
        required={required} />

      {
        loading ? (
          <div className='metadata_field__wrapper'>
            <div className='metadata_field__loading'>
              {l10n.t(LocalizationKey.panelFieldsContentTypeRelationshipFieldLoading)}
            </div>
          </div>
        ) : (
          <>
            <Downshift
              ref={dsRef}
              onSelect={(selected) => onValueChange(selected || '')}
              itemToString={(item) => (item ? item : '')}
            >
              {({ getToggleButtonProps, getItemProps, getMenuProps, isOpen, getRootProps }) => (
                <div
                  {...getRootProps(undefined, { suppressRefError: true })}
                  className={`metadata_field__choice`}
                >
                  <button
                    {...getToggleButtonProps({
                      className: `metadata_field__choice__toggle`,
                      disabled: availableChoices.length === 0
                    })}
                  >
                    <span>{`Select ${label}`}</span>
                    <ChevronDownIcon className="icon" />
                  </button>

                  <ul
                    className={`metadata_field__choice_list ${isOpen ? 'open' : 'closed'}`}
                    {...getMenuProps()}
                  >
                    {isOpen
                      ? availableChoices.map((choice: Page, index) => (
                        <li
                          {...getItemProps({
                            key: getValue(choice, contentTypeValue),
                            index,
                            item: getValue(choice, contentTypeValue),
                          })}
                        >
                          {choice.title || (
                            <span className={`metadata_field__choice_list__item`}>
                              {l10n.t(LocalizationKey.commonClearValue)}
                            </span>
                          )}
                        </li>
                      ))
                      : null}
                  </ul>
                </div>
              )}
            </Downshift>

            <FieldMessage
              name={label.toLowerCase()}
              description={description}
              showRequired={showRequiredState}
            />

            {crntSelected instanceof Array
              ? crntSelected.map((value: string) => (
                <ChoiceButton
                  key={value}
                  value={value}
                  title={getChoiceValue(value)}
                  onClick={removeSelected}
                />
              ))
              : crntSelected && (
                <ChoiceButton
                  key={crntSelected}
                  value={crntSelected}
                  title={getChoiceValue(crntSelected)}
                  onClick={removeSelected}
                />
              )}
          </>
        )
      }
    </div>
  );
};
