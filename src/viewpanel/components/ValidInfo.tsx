import * as React from 'react';
import { Icon } from './Icon';

export interface IValidInfoProps {
  isValid: boolean;
}

export const ValidInfo: React.FunctionComponent<IValidInfoProps> = ({isValid}: React.PropsWithChildren<IValidInfoProps>) => {
  return (
    <>
      {
        isValid ? (
          <span className="valid"><Icon name="check" /></span>
        ) : (
          <span className="warning"><Icon name="warning" /></span>
        )
      }
    </>
  );
};