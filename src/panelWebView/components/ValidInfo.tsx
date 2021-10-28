import * as React from 'react';
import { CheckIcon } from './Icons/CheckIcon';
import { WarningIcon } from './Icons/WarningIcon';

export interface IValidInfoProps {
  label?: string;
  isValid: boolean;
}

const ValidInfo: React.FunctionComponent<IValidInfoProps> = ({label, isValid}: React.PropsWithChildren<IValidInfoProps>) => {
  return (
    <>
      {
        isValid ? (
          <span className="valid"><CheckIcon /></span>
        ) : (
          <span className="warning"><WarningIcon /></span>
        )
      }
      { label && <span>{label}</span> }
    </>
  );
};

ValidInfo.displayName = 'ValidInfo';
export { ValidInfo };