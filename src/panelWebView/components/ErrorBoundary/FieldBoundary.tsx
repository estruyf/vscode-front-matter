import * as React from 'react';
import * as Sentry from '@sentry/react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { VSCodeLabel } from '../VSCode';

export interface IFieldBoundaryProps {
  fieldName: string;
}

export interface IFieldBoundaryState {
  hasError: boolean;
}

export default class FieldBoundary extends React.Component<
  IFieldBoundaryProps,
  IFieldBoundaryState
> {
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
          <VSCodeLabel>
            <div className={`metadata_field__label`}>
              <span style={{ lineHeight: '16px' }}>{this.props.fieldName}</span>
            </div>
          </VSCodeLabel>
          <div className={`metadata_field__error`}>
            <span>
              {l10n.t(LocalizationKey.panelErrorBoundaryFieldBoundaryLabel)}
            </span>

            <button onClick={() => this.setState({ hasError: false })}>
              {l10n.t(LocalizationKey.commonRetry)}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children as any;
  }
}
