import * as React from 'react';

export interface ISeoDetailsProps {
  allowedLength: number;
  title: string;
  value: string;
}

export const SeoDetails: React.FunctionComponent<ISeoDetailsProps> = (props: React.PropsWithChildren<ISeoDetailsProps>) => {
  const { allowedLength, title, value } = props;

  return (
    <div className={`seo__status__details ${value.length <= allowedLength ? "valid" : "not-valid"}`}>
      <h4><strong>{title}</strong></h4>
      <ul>
        <li><b>Length</b>: {value.length}</li>
        <li><b>Recommended length</b>: {allowedLength}</li>
      </ul>
    </div>
  );
};