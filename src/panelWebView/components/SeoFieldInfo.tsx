import * as React from 'react';
import { ValidInfo } from './ValidInfo';
import { VSCodeTableCell, VSCodeTableRow } from './VSCode/VSCodeTable';

export interface ISeoFieldInfoProps {
  title: string;
  value: any;
  recommendation: any;
  isValid?: boolean;
}

const SeoFieldInfo: React.FunctionComponent<ISeoFieldInfoProps> = ({
  title,
  value,
  recommendation,
  isValid
}: React.PropsWithChildren<ISeoFieldInfoProps>) => {
  return (
    <VSCodeTableRow>
      <VSCodeTableCell className={`capitalize`}>{title}</VSCodeTableCell>
      <VSCodeTableCell>{value}/{recommendation}</VSCodeTableCell>
      <VSCodeTableCell>{isValid !== undefined ? <ValidInfo label={undefined} isValid={isValid} /> : <span>-</span>}</VSCodeTableCell>
    </VSCodeTableRow>
  );
};

SeoFieldInfo.displayName = 'SeoFieldInfo';
export { SeoFieldInfo };
