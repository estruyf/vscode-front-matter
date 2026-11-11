import * as React from 'react';
import { useEffect, useState } from 'react';
import { CustomPanelViewResult } from '../../../models';
import { Collapsible } from '../Collapsible';

export interface ICustomViewProps {
  metadata?: any;
}

export const CustomView: React.FunctionComponent<ICustomViewProps> = ({ metadata }: React.PropsWithChildren<ICustomViewProps>) => {
  const [customViewTitle, setCustomViewTitle] = useState<string | undefined>(undefined);
  const [customHtml, setCustomHtml] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Ignore the result of a previous call when the metadata changed in the meantime
    let isOutdated = false;

    if (window.fmExternal && window.fmExternal.getPanelView) {
      window.fmExternal.getPanelView(metadata).then((viewDetails: CustomPanelViewResult | undefined) => {
        if (isOutdated) {
          return;
        }

        if (viewDetails && viewDetails.title && viewDetails.content) {
          setCustomViewTitle(viewDetails.title);
          setCustomHtml(viewDetails.content);
        } else {
          setCustomViewTitle(undefined);
          setCustomHtml(undefined);
        }
      });
    }

    return () => {
      isOutdated = true;
    };
  }, [metadata]);

  if (!customHtml || !customViewTitle) {
    return null;
  }


  return (
    <Collapsible
      id={`custom-view`}
      className={`base__actions`}
      title={customViewTitle}
    >
      <div dangerouslySetInnerHTML={{ __html: customHtml }} />
    </Collapsible>
  );
};