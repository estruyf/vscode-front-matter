import * as React from 'react';
import { Tags } from './Tags';
import { usePrevious } from '../hooks/usePrevious';
import { CommandToCode } from '../CommandToCode';
import { TagType } from '../TagType';
import Downshift from 'downshift';
import { AddIcon } from './Icons/AddIcon';
import { VsLabel } from './VscodeComponents';
import { MessageHelper } from '../../helpers/MessageHelper';
import { CustomTaxonomyData } from '../../models';

export interface ITagPickerProps {
  type: TagType;
  icon: JSX.Element;
  label?: string;
  crntSelected: string[];
  options: string[];
  freeform: boolean;
  focussed: boolean;
  unsetFocus: () => void;
  disableConfigurable?: boolean;
  fieldName?: string;
  taxonomyId?: string;
}

const TagPicker: React.FunctionComponent<ITagPickerProps> = (props: React.PropsWithChildren<ITagPickerProps>) => {
  const { label, icon, type, crntSelected, options, freeform, focussed, unsetFocus, disableConfigurable, fieldName, taxonomyId } = props;
  const [ selected, setSelected ] = React.useState<string[]>([]);
  const [ inputValue, setInputValue ] = React.useState<string>("");
  const prevSelected = usePrevious(crntSelected);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const dsRef = React.useRef<Downshift<string> | null>(null);

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
    if (type === TagType.tags) {
      MessageHelper.sendMessage(CommandToCode.addTagToSettings, tag);
    } else if (type === TagType.categories) {
      MessageHelper.sendMessage(CommandToCode.addCategoryToSettings, tag);
    } else if (type === TagType.custom) {
      MessageHelper.sendMessage(CommandToCode.addToCustomTaxonomy, {
        id: taxonomyId,
        name: fieldName,
        option: tag
      } as CustomTaxonomyData);
    }
  };

  /**
   * Send an update to VSCode
   * @param values 
   */
  const sendUpdate = (values: string[]) => {    
    if (type === TagType.tags) {
      MessageHelper.sendMessage(CommandToCode.updateTags, values);
    } else if (type === TagType.categories) {
      MessageHelper.sendMessage(CommandToCode.updateCategories, values);
    } else if (type === TagType.keywords) {
      MessageHelper.sendMessage(CommandToCode.updateKeywords, values);
    } else if (type === TagType.custom) {
      MessageHelper.sendMessage(CommandToCode.updateCustomTaxonomy, {
        id: taxonomyId,
        name: fieldName,
        options: values
      } as CustomTaxonomyData);
    }
  };

  /**
   * Triggers the focus to the input when command is executed
   */
  const triggerFocus = () => {
    if (focussed && inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };

  /**
   * On item selection
   * @param selectedItem 
   * @param compState 
   */
  const onSelect = (selectedItem: string | null) => {
    if (selectedItem) {
      let value = selectedItem || "";

      const item = options.find(o => o?.toLowerCase() === selectedItem?.toLowerCase());
      if (item) {
        value = item;
      }

      const uniqValues = Array.from(new Set([...selected, value]));
      setSelected(uniqValues);
      sendUpdate(uniqValues);
      setInputValue("");
    }
  };

  /**
   * Inserts a tag which is not known
   * @param closeMenu 
   */
  const insertUnkownTag = (closeMenu: (cb?: any) => void) => {
    if (inputValue) {
      onSelect(inputValue);
      closeMenu();
    }
  };

  /**
   * Filters the options which can be selected
   * @param option 
   * @param inputValue 
   */
  const filterList = (option: string, inputValue: string | null) => {
    return !selected.includes(option) && option.toLowerCase().includes((inputValue || "").toLowerCase());
  };

  React.useEffect(() => {
    setTimeout(() => {
      triggerFocus();
    }, 100);
  }, [focussed]);
  
  React.useEffect(() => {
    if (prevSelected !== crntSelected) {
      setSelected(typeof crntSelected === "string" ? [crntSelected] : crntSelected);
    }
  }, [crntSelected]);
  
  return (
    <div className={`article__tags`}>      
      <VsLabel>
        <div className={`metadata_field__label`}>
          {icon} <span style={{ lineHeight: "16px"}}>{label || type}</span>
        </div>
      </VsLabel>

      <Downshift ref={dsRef}
                 onChange={(selected) => onSelect(selected || "")}
                 itemToString={item => (item ? item : '')}
                 inputValue={inputValue}
                 onInputValueChange={(value) => setInputValue(value)}>
        {
          ({ getInputProps, getItemProps, getMenuProps, isOpen, inputValue, getRootProps, openMenu, closeMenu, clearSelection }) => (
            <>
              <div {...getRootProps(undefined, {suppressRefError: true})} className={`article__tags__input ${freeform ? 'freeform' : ''}`}>
                <input {
                          ...getInputProps({ 
                            ref: inputRef, 
                            onFocus: openMenu as any, 
                            onClick: openMenu as any,
                            onBlur: () => { 
                              closeMenu(); 
                              unsetFocus(); 
                              if (!inputValue) {
                                clearSelection();
                              }
                            }
                          })
                       }
                       placeholder={`Pick your ${label || type.toLowerCase()}`} />
                
                {
                  freeform && (
                    <button className={`article__tags__input__button`}
                            title={`Add the unknown tag`}
                            disabled={!inputValue} 
                            onClick={() => insertUnkownTag(closeMenu)}>
                      <AddIcon />
                    </button>
                  )
                }
              </div>

              <ul className={`article__tags__dropbox ${isOpen ? "open" : "closed" }`} {...getMenuProps()}>
                { 
                  isOpen ? options.filter((option) => filterList(option, inputValue)).map((item, index) => (
                    <li {...getItemProps({ key: item, index, item })}>
                      { item }
                    </li>
                  )) : null
                }
              </ul>
            </>
          )
        }
      </Downshift>

      <Tags 
        values={(selected || []).sort((a: string, b: string) => a?.toLowerCase() < b?.toLowerCase() ? -1 : 1 )} 
        onRemove={onRemove} 
        onCreate={onCreate} 
        options={options} 
        disableConfigurable={!!disableConfigurable} />
    </div>
  );
};

TagPicker.displayName = 'TagPicker';
export { TagPicker };