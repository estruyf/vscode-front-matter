import * as React from 'react';

export interface IToggleProps {
  checked: boolean;
  onChanged: (checked: boolean) => void;
}

export const Toggle: React.FunctionComponent<IToggleProps> = ({checked, onChanged}: React.PropsWithChildren<IToggleProps>) => {
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
    <label className="field__toggle">
      <input type="checkbox" checked={isChecked} onChange={onChange} />
      <span className="field__toggle__slider"></span>
    </label>
  );
};