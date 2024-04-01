import * as React from 'react';

export interface IDetailsItemProps {
  title: string;
  details: string;
}

export const DetailsItem: React.FunctionComponent<IDetailsItemProps> = ({ title, details }: React.PropsWithChildren<IDetailsItemProps>) => {
  return (
    <>
      <div className="py-3 flex justify-between text-sm font-medium">
        <dt className={`text-[var(--vscode-editor-foreground)]`}>{title}</dt>
        <dd className={`text-right text-[var(--frontmatter-text)]`}>
          {details}
        </dd>
      </div>
    </>
  );
};