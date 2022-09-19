import * as React from 'react';

export interface IFieldMessageProps {
  name: string;
  description?: string;
  showRequired?: boolean;
}

export const FieldMessage: React.FunctionComponent<IFieldMessageProps> = ({ name, description, showRequired }: React.PropsWithChildren<IFieldMessageProps>) => {

  if (!showRequired && !description) {
    return null;
  }

  if (showRequired) {
    return (
      <div className={`metadata_field__required__message`}>
        The {name} field is required.
      </div>
    );
  }

  if (description) {
    return (
      <div className={`metadata_field__description`}>
        {description}
      </div>
    );
  }

  return null;
};