import * as React from 'react';

export interface IRequiredMessageProps {
  name: string;
  show?: boolean;
}

export const RequiredMessage: React.FunctionComponent<IRequiredMessageProps> = ({ name, show }: React.PropsWithChildren<IRequiredMessageProps>) => {

  if (!show) {
    return null;
  }

  return (
    <div className={`metadata_field__required__message`}>
      The {name} field is required.
    </div>
  );
};