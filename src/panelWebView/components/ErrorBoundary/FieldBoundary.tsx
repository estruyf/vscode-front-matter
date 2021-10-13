import * as React from 'react';
import * as Sentry from "@sentry/react";
import { VsLabel } from '../VscodeComponents';

export interface IFieldBoundaryProps {
  fieldName: string;
}

export interface IFieldBoundaryState {
  hasError: boolean;
}

export default class FieldBoundary extends React.Component<IFieldBoundaryProps, IFieldBoundaryState> {

  constructor(props: IFieldBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: any, errorInfo: any) {
    Sentry.captureMessage(`Field boundary: ${error?.message || error}`);
  }

  public render(): React.ReactElement<IFieldBoundaryProps> {
    if (this.state.hasError) {
      return (
        <div className={`metadata_field`}>
          <VsLabel>
            <div className={`metadata_field__label`}>
              <span style={{ lineHeight: "16px"}}>{this.props.fieldName}</span>
            </div>
          </VsLabel>
          <div className={`metadata_field__error`}>
            <span>Error loading field</span>

            <button onClick={() => this.setState({ hasError: false })}>Retry</button>
          </div>
        </div>
      );
    }

    return this.props.children as any; 
  }
}