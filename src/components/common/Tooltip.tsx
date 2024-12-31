import * as React from 'react';
import { Tooltip as TT } from 'react-tooltip'

export interface ITooltipProps {
  id: string;
  render?: () => React.ReactNode;
}

export const Tooltip: React.FunctionComponent<ITooltipProps> = ({
  id,
  render
}: React.PropsWithChildren<ITooltipProps>) => {

  const tooltipClasses = `!py-[2px] !px-[8px] !rounded-[3px] !border-[var(--vscode-editorHoverWidget-border)] !border !border-solid !bg-[var(--vscode-editorHoverWidget-background)] !text-[var(--vscode-editorHoverWidget-foreground)] !font-normal !opacity-100 shadow-[0_2px_8px_var(--vscode-widget-shadow)] text-left`;
  
  return (
    <TT 
      id={id}
      className={tooltipClasses} 
      style={{
        fontSize: '12px',
        lineHeight: '19px'
      }}
      render={render} />
  );
};