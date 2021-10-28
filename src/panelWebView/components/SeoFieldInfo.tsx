import * as React from 'react';
import { ValidInfo } from './ValidInfo';
import { VsTableCell, VsTableRow } from './VscodeComponents';

export interface ISeoFieldInfoProps {
  title: string;
  value: any;
  recommendation: any;
  isValid?: boolean;
}

const SeoFieldInfo: React.FunctionComponent<ISeoFieldInfoProps> = ({ title, value, recommendation, isValid }: React.PropsWithChildren<ISeoFieldInfoProps>) => {
  return (
    <VsTableRow>
      <VsTableCell className={`table__cell table__title`}>{title}</VsTableCell>
      <VsTableCell className={`table__cell`}>{value}/{recommendation}</VsTableCell>
      <VsTableCell className={`table__cell table__cell__validation`}>
        { isValid !== undefined ? <ValidInfo label={undefined} isValid={isValid} /> : <span>-</span> }
      </VsTableCell>
    </VsTableRow>
  );
};

SeoFieldInfo.displayName = 'SeoFieldInfo';
export { SeoFieldInfo };