import * as React from 'react';
import { CheckIcon } from './Icons/CheckIcon';
import { WarningIcon } from './Icons/WarningIcon';

export interface IValidInfoProps {
  isValid: boolean;
}

export const ValidInfo: React.FunctionComponent<IValidInfoProps> = ({isValid}: React.PropsWithChildren<IValidInfoProps>) => {
  return (
    <>
      {
        isValid ? (
          <span className="valid"><CheckIcon /></span>
        ) : (
          <span className="warning"><WarningIcon /></span>
        )
      }
    </>
  );
};