import * as React from 'react';
import { Tags } from './Tags';
import { usePrevious } from '../hooks/usePrevious';
import { CommandToCode } from '../CommandToCode';
import { TagType } from '../TagType';
import { MessageHelper } from '../helper/MessageHelper';
import Downshift from 'downshift';

export interface KeyValue { key: string, value: string };

export interface ITagPickerProps {
  type: string;
  crntSelected: string[];
  options: KeyValue[];
  freeform: boolean;
  focussed: boolean;
  unsetFocus: () => void;
}

export const TagPicker: React.FunctionComponent<ITagPickerProps> = (props: React.PropsWithChildren<ITagPickerProps>) => {
  const { type, crntSelected, options, freeform, focussed, unsetFocus } = props;
  const [ selected, setSelected ] = React.useState<string[]>([]);
  const [ inputValue, setInputValue ] = React.useState<string>("");
  const prevSelected = usePrevious(crntSelected);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const dsRef = React.useRef<Downshift<KeyValue> | null>(null);

  /**
   * Removes an option
   * @param tag 
   */
  const onRemove = (tag: string) => {
    const newSelection = selected.filter(s => s !== tag);
    setSelected(newSelection);
    sendUpdate(newSelection);
  };

  /**
   * Create the tag
   * @param tag 
   */
  const onCreate = (tag: string) => {
    const cmdType = type === TagType.tags ? CommandToCode.addTagToSettings : CommandToCode.addCategoryToSettings;
    MessageHelper.sendMessage(cmdType, tag);
  };

  /**
   * Send an update to VSCode
   * @param values 
   */
  const sendUpdate = (values: string[]) => {
    const cmdType = type === TagType.tags ? CommandToCode.updateTags : CommandToCode.updateCategories;
    MessageHelper.sendMessage(cmdType, values);
  };

  /**
   * Triggers the focus to the input when command is executed
   */
  const triggerFocus = () => {
    if (focussed && inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }

  /**
   * On item selection
   * @param selectedItem 
   * @param compState 
   */
  const onSelect = (selectedItem: string | null) => {
    console.log(selectedItem)
    if (selectedItem) {
      let value = selectedItem || "";

      const item = options.find(o => o.key === selectedItem.toLowerCase());
      if (item && item.value) {
        value = item.value;
      }

      const uniqValues = Array.from(new Set([...selected, value]));
      setSelected(uniqValues);
      sendUpdate(uniqValues);
      setInputValue("");
    }
  }

  /**
   * Allow free value entries
   * @param event 
   */
  const onEnterSelection = (event: React.KeyboardEvent<HTMLInputElement>, closeCb: () => void) => {
    if (freeform && event.key === "Enter" && inputValue) {
      setTimeout(() => {
        onSelect(inputValue);
      }, 100);
    } else if (event.key === "Escape") {
      if (closeCb) {
        closeCb();
      }
    } else {
      return true;
    }
  }

  /**
   * Filters the options which can be selected
   * @param option 
   * @param inputValue 
   */
  const filterList = (option: KeyValue, inputValue: string | null) => {
    return !selected.includes(option.value) && option.key.includes((inputValue || "").toLowerCase());
  }

  function stateReducer(state: any, changes: any) {
    // this prevents the menu from being closed when the user
    // selects an item with a keyboard or mouse
    switch (changes.type) {
      case Downshift.stateChangeTypes.keyDownEnter:
        console.log(`Enter`, JSON.stringify(changes));
        return changes;
      default:
        return changes
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
      <h3>{type}</h3>

      <Downshift ref={dsRef}
                 onChange={(selected) => onSelect(selected?.key || "")}
                 itemToString={item => (item ? item.value : '')}
                 inputValue={inputValue}
                 onInputValueChange={(value) => setInputValue(value)}
                 stateReducer={stateReducer}>
        {
          ({ getInputProps, getItemProps, getMenuProps, isOpen, inputValue, getRootProps, openMenu, closeMenu }) => (
            <>
              <div {...getRootProps(undefined, {suppressRefError: true})}>
                <input {...getInputProps({ 
                          ref: inputRef, 
                          onFocus: openMenu as any, 
                          onClick: openMenu as any,
                          onBlur: () => { closeMenu(); unsetFocus(); },
                          onKeyDown: (e) => onEnterSelection(e, closeMenu)
                       })}
                       placeholder={`Pick your ${type.toLowerCase()}`} />
              </div>

              <ul className={`article__tags__dropbox ${isOpen ? "open" : "closed" }`} {...getMenuProps()}>
                { 
                  isOpen ? options.filter((option) => filterList(option, inputValue)).map((item, index) => (
                    <li {...getItemProps({ key: item.value, index, item })} >
                      { item.value }
                    </li>
                  )) : null
                }
              </ul>
            </>
          )
        }
      </Downshift>

      <Tags values={selected} onRemove={onRemove} onCreate={onCreate} options={options} />
    </div>
  );
};