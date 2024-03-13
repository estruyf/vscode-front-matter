import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';
import { VSCodeTable, VSCodeTableBody, VSCodeTableCell, VSCodeTableHead, VSCodeTableHeader, VSCodeTableRow } from './VSCode/VSCodeTable';

export interface ISeoDetailsProps {
  allowedLength: number;
  title: string;
  value: number;
  valueTitle: string;
  noValidation?: boolean;
}

const SeoDetails: React.FunctionComponent<ISeoDetailsProps> = (
  props: React.PropsWithChildren<ISeoDetailsProps>
) => {
  const { allowedLength, title, value, valueTitle, noValidation } = props;

  const validate = React.useMemo(() => {
    if (noValidation) {
      return '';
    }

    return value <= allowedLength ? 'valid' : 'not-valid';
  }, [value, allowedLength, noValidation]);

  return (
    <div className={`seo__status__details ${validate}`}>
      <h4>{title}</h4>

      <VSCodeTable>
        <VSCodeTableHeader>
          <VSCodeTableRow>
            <VSCodeTableHead className={validate}>{valueTitle}</VSCodeTableHead>
            <VSCodeTableHead>{l10n.t(LocalizationKey.panelSeoDetailsRecommended)}</VSCodeTableHead>
          </VSCodeTableRow>
        </VSCodeTableHeader>

        <VSCodeTableBody>
          <VSCodeTableRow>
            <VSCodeTableCell className={validate}>{value}</VSCodeTableCell>
            <VSCodeTableCell>{allowedLength}</VSCodeTableCell>
          </VSCodeTableRow>
        </VSCodeTableBody>
      </VSCodeTable>
    </div>
  );
};

SeoDetails.displayName = 'SeoDetails';
export { SeoDetails };
