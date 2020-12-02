import * as React from 'react';
import useAutocomplete from '@material-ui/lab/useAutocomplete';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Tags } from './Tags';
import { usePrevious } from '../hooks/usePrevious';
import useMessages from '../hooks/useMessages';
import { CommandToCode } from '../CommandToCode';
import { TagType } from '../TagType';

export interface ITagPickerProps {
  type: string;
  crntSelected: string[];
  options: string[];
}

const useStyles = makeStyles(() =>
  createStyles({
    label: {
      display: 'block',
    },
    input: {
      width: 200,
    },
    listbox: {
      width: 200,
      margin: 0,
      padding: 0,
      zIndex: 1,
      position: 'absolute',
      listStyle: 'none',
      overflow: 'auto',
      maxHeight: 200,
      border: '1px solid rgba(0,0,0,.8)'
    },
  }),
);

export const TagPicker: React.FunctionComponent<ITagPickerProps> = (props: React.PropsWithChildren<ITagPickerProps>) => {
  const { type, crntSelected, options } = props;
  const [ selected, setSelected ] = React.useState<string[]>([]);
  const prevSelected = usePrevious(crntSelected);
  const { sendMessage } = useMessages();

  const classes = useStyles();
  const { getRootProps, getInputProps, getListboxProps, getOptionProps, groupedOptions } = useAutocomplete({
    id: 'use-autocomplete',
    options: options,
    multiple: true,
    autoComplete: true,
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

  const sendUpdate = (values: string[]) => {
    const cmdType = type === TagType.tags ? CommandToCode.updateTags : CommandToCode.updateCategories;
    sendMessage(cmdType, values);
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
        <input className={classes.input} {...getInputProps()} placeholder={`Pick your ${type.toLowerCase()}`}/>
      </div>

      {
        groupedOptions.length > 0 ? (
          <ul className={classes.listbox} {...getListboxProps()}>
            {groupedOptions.map((option, index) => (
              <li key={index} {...getOptionProps({ option, index })}>{option}</li>
            ))}
          </ul>
        ) : null
      }

      <Tags values={selected} onRemove={onRemove} options={options} />
    </div>
  );
};