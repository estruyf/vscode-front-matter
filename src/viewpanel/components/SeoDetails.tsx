import * as React from 'react';

export interface ISeoDetailsProps {
  allowedLength?: number;
  title: string;
  value: number;
  valueTitle: string;
}

export const SeoDetails: React.FunctionComponent<ISeoDetailsProps> = (props: React.PropsWithChildren<ISeoDetailsProps>) => {
  const { allowedLength, title, value, valueTitle } = props;

  const validate = () => {
    if (allowedLength === undefined) {
      return "";
    }

    return value <= allowedLength ? "valid" : "not-valid"
  };

  return (
    <div className={`seo__status__details ${validate}`}>
      <h4><strong>{title}</strong></h4>
      <ul>
        <li><b>{valueTitle}</b>: {value}</li>
        { allowedLength && <li><b>Recommended length</b>: {allowedLength}</li>}
      </ul>
    </div>
  );
};