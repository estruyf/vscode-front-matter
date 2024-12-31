import * as React from 'react';
import { ValidInfo } from './ValidInfo';
import { VSCodeTableCell, VSCodeTableRow } from './VSCode/VSCodeTable';

export interface ISeoFieldInfoProps {
  title: string;
  value: string;
  recommendation: string;
  isValid?: boolean;
  className?: string;
}

const SeoFieldInfo: React.FunctionComponent<ISeoFieldInfoProps> = ({
  title,
  value,
  recommendation,
  isValid,
  className
}: React.PropsWithChildren<ISeoFieldInfoProps>) => {
  return (
    <VSCodeTableRow className={className || ""}>
      <VSCodeTableCell className={`capitalize`}>{title}</VSCodeTableCell>
      <VSCodeTableCell className='flex items-center text-nowrap'>{isValid !== undefined ? <ValidInfo label={undefined} isValid={isValid} /> : <span className='inline-block w-4 mr-2'>&mdash;</span>} {value}/{recommendation}</VSCodeTableCell>
    </VSCodeTableRow>
  );
};

SeoFieldInfo.displayName = 'SeoFieldInfo';
export { SeoFieldInfo };
