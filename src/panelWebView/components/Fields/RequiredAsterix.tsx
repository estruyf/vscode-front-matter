import * as React from 'react';

export interface IRequiredAsterixProps {
  required?: boolean;
}

export const RequiredAsterix: React.FunctionComponent<IRequiredAsterixProps> = ({ required }: React.PropsWithChildren<IRequiredAsterixProps>) => {
  if (!required) {
    return null;
  }

  return (
    <span className={`metadata_field__required__asterix`}>*</span>
  );
};