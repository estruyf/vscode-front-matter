import * as React from 'react';

export interface IVSCodeLabelProps { }

export const VSCodeLabel: React.FunctionComponent<IVSCodeLabelProps> = ({
  children
}: React.PropsWithChildren<IVSCodeLabelProps>) => {
  const DEFAULT_LINE_HEIGHT = 16;
  const DEFAULT_FONT_SIZE = 13;

  const INPUT_LINE_HEIGHT_RATIO = DEFAULT_LINE_HEIGHT / DEFAULT_FONT_SIZE;

  return (
    <label style={{
      color: "var(--vscode-foreground)",
      fontFamily: "var(--vscode-font-family)",
      fontSize: "var(--vscode-font-size)",
      fontWeight: "600",
      lineHeight: INPUT_LINE_HEIGHT_RATIO,
      cursor: "default",
      display: "block",
      padding: "5px 0"
    }}>
      {children}
    </label >
  );
};