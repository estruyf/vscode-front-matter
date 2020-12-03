import * as React from 'react';
import useAutocomplete from '@material-ui/lab/useAutocomplete';
import { Tags } from './Tags';
import { usePrevious } from '../hooks/usePrevious';
import { CommandToCode } from '../CommandToCode';
import { TagType } from '../TagType';
import { MessageHelper } from '../helper/MessageHelper';

export interface ITagPickerProps {
  type: string;
  crntSelected: string[];
  options: string[];
  freeform: boolean;
}

export const TagPicker: React.FunctionComponent<ITagPickerProps> = (props: React.PropsWithChildren<ITagPickerProps>) => {
  const { type, crntSelected, options, freeform } = props;
  const [ selected, setSelected ] = React.useState<string[]>([]);
  const prevSelected = usePrevious(crntSelected);

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
  
  React.useEffect(() => {
    if (prevSelected !== crntSelected) {
      setSelected(crntSelected);
    }
  }, [crntSelected]);
  
  return (
    <div className={`article__tags`}>
      <h3>{type}</h3>

      <div {...getRootProps()}>
        <input {...getInputProps()} placeholder={`Pick your ${type.toLowerCase()}`} />
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