import * as React from 'react';
import Ajv from 'ajv';
import { useEffect, useState } from 'react';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';
import { AutoFields, AutoForm, ErrorsField } from '../../../components/uniforms-frontmatter';
import { ErrorBoundary } from '@sentry/react';
import { DataFormControls } from './DataFormControls';
import useThemeColors from '../../hooks/useThemeColors';

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
  const { getColors } = useThemeColors();

  const ajv = new Ajv({
    allErrors: true,
    useDefaults: true,
    strict: false,
  });

  const jsonValidator = (schema: object) => {
    const validator = ajv.compile(schema);

    return (crntModel: object) => {
      validator(crntModel);
      return validator.errors?.length ? { details: validator.errors } : null;
    };
  };

  useEffect(() => {
    const schemaValidator = jsonValidator(schema);
    const bridge = new JSONSchemaBridge(schema, schemaValidator);
    setBridge(bridge);
  }, [schema]);

  if (!bridge) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="autoform">
        {model ? (
          <h2 className={getColors(`text-gray-500 dark:text-whisper-900`, `text-[var(--frontmatter-secondary-text)]`)}>Modify the data</h2>
        ) : (
          <h2 className={getColors(`text-gray-500 dark:text-whisper-900`, `text-[var(--frontmatter-secondary-text)]`)}>Add new data</h2>
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
