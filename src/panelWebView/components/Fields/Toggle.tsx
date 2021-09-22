import * as React from 'react';
import { RocketIcon } from '../Icons/RocketIcon';
import { VsLabel } from '../VscodeComponents';

export interface IToggleProps {
  label: string;
  checked: boolean;
  onChanged: (checked: boolean) => void;
}

export const Toggle: React.FunctionComponent<IToggleProps> = ({label, checked, onChanged}: React.PropsWithChildren<IToggleProps>) => {
  const [ isChecked, setIsChecked ] = React.useState(checked);
  
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(!isChecked);
    onChanged(!isChecked);
  };

  React.useEffect(() => {
    if (isChecked !== checked) {
      setIsChecked(checked);
    }
  }, [ checked ]);

  return (
    <div className={`metadata_field`}>
      <VsLabel>
        <div className={`metadata_field__label`}>
          <RocketIcon /> <span style={{ lineHeight: "16px"}}>{label}</span>
        </div>
      </VsLabel>

    
      <label className="field__toggle">
        <input type="checkbox" checked={isChecked} onChange={onChange} />
        <span className="field__toggle__slider"></span>
      </label>
    </div>
  );
};