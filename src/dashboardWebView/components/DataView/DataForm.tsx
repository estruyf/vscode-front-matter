import * as React from 'react';
import Ajv from 'ajv';
import { useEffect, useState } from 'react';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';
import { AutoFields, AutoForm, ErrorsField } from '../../../components/uniforms-frontmatter';
import { ErrorBoundary } from '@sentry/react';
import { DataFormControls } from './DataFormControls';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IDataFormProps {
  schema: any;
  model: any;
  onSubmit: (model: any) => void;
  onClear: () => void;
}

export const DataForm: React.FunctionComponent<IDataFormProps> = ({
  schema,
  model,
  onSubmit,
  onClear
}: React.PropsWithChildren<IDataFormProps>) => {
  const [bridge, setBridge] = useState<JSONSchemaBridge | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const ajv = new Ajv({
    allErrors: true,
    useDefaults: true,
    validateSchema: false,
    strict: false,
    strictTypes: false
  });

  // Added the multiline keyword for the textarea field
  ajv.addKeyword({
    keyword: 'multiline',
    type: 'boolean',
    schemaType: 'boolean'
  });

  const jsonValidator = (schema: object) => {
    try {
      setError(undefined);
      const validator = ajv.compile(schema);

      return (crntModel: object) => {
        if (validator(crntModel)) {
          return null;
        } else {
          return { details: validator.errors }
        }
      };
    } catch (error) {
      setError((error as Error).message);
      return () => { };
    }
  };

  useEffect(() => {
    const schemaValidator = jsonValidator(schema);
    const bridge = new JSONSchemaBridge(schema, schemaValidator);
    setBridge(bridge);
  }, [schema]);

  if (!bridge) {
    return null;
  }

  if (error) {
    return (
      <div className={`mt-4 text-[var(--vscode-errorForeground)]`}>
        {error}
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="autoform">
        {model ? (
          <h2 className={`text-[var(--frontmatter-secondary-text)]`}>
            {l10n.t(LocalizationKey.dashboardDataViewDataFormModify)}
          </h2>
        ) : (
          <h2 className={`text-[var(--frontmatter-secondary-text)]`}>
            {l10n.t(LocalizationKey.dashboardDataViewDataFormAdd)}
          </h2>
        )}

        <AutoForm
          schema={bridge}
          model={model || {}}
          onSubmit={onSubmit}
          ref={(form: any) => form?.reset()}
        >
          <div className={`fields`}>
            <AutoFields />
          </div>

          <div className={`errors`}>
            <ErrorsField />
          </div>
          <DataFormControls model={model} onClear={onClear} />
        </AutoForm>
      </div>
    </ErrorBoundary>
  );
};
