import * as React from 'react';
import useAutocomplete from '@material-ui/lab/useAutocomplete';
import { Tags } from './Tags';
import { usePrevious } from '../hooks/usePrevious';
import { CommandToCode } from '../CommandToCode';
import { TagType } from '../TagType';
import { MessageHelper } from '../helper/MessageHelper';
import { TextField } from '@material-ui/core';
import Downshift from 'downshift'

export interface ITagPickerProps {
  type: string;
  crntSelected: string[];
  options: string[];
  freeform: boolean;
  focussed: boolean;
  unsetFocus: () => void;
}

// https://v4-2-1.material-ui.com/components/autocomplete/
// https://github.com/downshift-js/downshift/issues/751

export const TagPicker: React.FunctionComponent<ITagPickerProps> = (props: React.PropsWithChildren<ITagPickerProps>) => {
  const { type, crntSelected, options, freeform, focussed, unsetFocus } = props;
  const [ selected, setSelected ] = React.useState<string[]>([]);
  const prevSelected = usePrevious(crntSelected);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const { getRootProps, getInputProps, getListboxProps, getOptionProps, groupedOptions } = useAutocomplete({
    id: 'use-autocomplete',
    options: options,
    multiple: true,
    freeSolo: freeform,
    value: crntSelected,
    getOptionDisabled: (option) => selected.includes(option),
    onChange: (e, values: string[]) => {
      const uniqValues = Array.from(new Set([...selected, ...values]));
      setSelected(uniqValues);
      sendUpdate(uniqValues);
    }
  });

  const onRemove = (tag: string) => {
    const newSelection = selected.filter(s => s !== tag);
    setSelected(newSelection);
    sendUpdate(newSelection);
  };

  const onCreate = (tag: string) => {
    const cmdType = type === TagType.tags ? CommandToCode.addTagToSettings : CommandToCode.addCategoryToSettings;
    MessageHelper.sendMessage(cmdType, tag);
  };

  const sendUpdate = (values: string[]) => {
    const cmdType = type === TagType.tags ? CommandToCode.updateTags : CommandToCode.updateCategories;
    MessageHelper.sendMessage(cmdType, values);
  };

  const triggerFocus = () => {
    if (focussed && inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }

  React.useEffect(() => {
    setTimeout(() => {
      triggerFocus();
    }, 100);
  }, [focussed]);
  
  React.useEffect(() => {
    if (prevSelected !== crntSelected) {
      setSelected(crntSelected);
    }
  }, [crntSelected]);
  
  return (
    <div className={`article__tags`}>
      <h3>{type} - {focussed ? 'true' : 'false'}</h3>


      <Downshift onChange={selection =>
          alert(selection ? `You selected ${selection.value}` : 'Selection Cleared')
        }
        itemToString={item => (item ? item.value : '')}>
        {({
          getInputProps,
          getItemProps,
          getMenuProps,
          isOpen,
          inputValue,
          highlightedIndex,
          selectedItem,
          getRootProps,
          openMenu
        }) => (
          <>
            <div
              style={{display: 'inline-block'}}
              {...getRootProps(undefined, {suppressRefError: true})}
            >
              <input {...getInputProps({ ref: inputRef, onFocus: openMenu })} onBlur={unsetFocus} />
            </div>
            <ul {...getMenuProps()}>
              { isOpen ? options.filter(item => !inputValue || item.includes(inputValue)).map((item, index) => (
                      <li
                        {...getItemProps({
                          key: item,
                          index,
                          item,
                          style: {
                            backgroundColor: highlightedIndex === index ? 'lightgray' : 'white',
                            fontWeight: selectedItem === item ? 'bold' : 'normal',
                          }
                        })}
                      >
                        {item}
                      </li>
                    ))
                : null}
            </ul>
          </>
        )}
      </Downshift>

      <div {...getRootProps()}>
        <TextField {...getInputProps()} placeholder={`Pick your ${type.toLowerCase()}`} />
      </div>

      {
        groupedOptions.length > 0 ? (
          <ul className={`article__tags__dropbox`} {...getListboxProps()}>
            {groupedOptions.map((option, index) => (
              <li key={index} {...getOptionProps({ option, index })}>{option}</li>
            ))}
          </ul>
        ) : null
      }

      <Tags values={selected} onRemove={onRemove} onCreate={onCreate} options={options} />
    </div>
  );
};