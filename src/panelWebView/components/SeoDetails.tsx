import * as React from 'react';
import { VsTable, VsTableBody, VsTableHeader, VsTableHeaderCell, VsTableRow, VsTableCell } from './VscodeComponents';

export interface ISeoDetailsProps {
  allowedLength: number;
  title: string;
  value: number;
  valueTitle: string;
  noValidation?: boolean;
}

const SeoDetails: React.FunctionComponent<ISeoDetailsProps> = (props: React.PropsWithChildren<ISeoDetailsProps>) => {
  const { allowedLength, title, value, valueTitle, noValidation } = props;

  const validate = () => {
    if (noValidation) {
      return "";
    }

    return value <= allowedLength ? "valid" : "not-valid"
  };

  return (
    <div className={`seo__status__details ${validate()}`}>
      <h4>{title}</h4>

      <VsTable bordered>
        <VsTableHeader slot="header">
          <VsTableHeaderCell className={validate()}>{valueTitle}</VsTableHeaderCell>
          <VsTableHeaderCell>Recommended</VsTableHeaderCell>
        </VsTableHeader>
        <VsTableBody slot="body">
          <VsTableRow>
            <VsTableCell className={validate()}>{value}</VsTableCell>
            <VsTableCell>{allowedLength}</VsTableCell>
          </VsTableRow>
        </VsTableBody>
      </VsTable>
    </div>
  );
};

SeoDetails.displayName = 'SeoDetails';
export { SeoDetails };