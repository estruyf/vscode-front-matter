import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import JSONSchemaBridge from 'uniforms-bridge-json-schema';
import { AutoFields, AutoForm, ErrorsField } from '../../../components/uniforms-frontmatter';
import { JsonFieldControls } from './JsonFieldControls';
import Ajv from 'ajv';

export interface IJsonFieldFormProps {
  label: string;
  schema: any | null;
  model: any | null;
  onUpdate: (data: any) => void;
  onClear: () => void;
}

export const JsonFieldForm: React.FunctionComponent<IJsonFieldFormProps> = ({
  label,
  schema,
  model,
  onUpdate,
  onClear
}: React.PropsWithChildren<IJsonFieldFormProps>) => {
  const [bridge, setBridge] = useState<JSONSchemaBridge | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formRef = useRef<any>(null);

  const ajv = new Ajv({ allErrors: true, useDefaults: true, strict: false });

  const jsonValidator = (crntSchema: object) => {
    const validator = ajv.compile(crntSchema);

    return (crntModel: object) => {
      validator(crntModel);
      return validator.errors?.length ? { details: validator.errors } : null;
    };
  };

  useEffect(() => {
    if (schema) {
      const schemaValidator = jsonValidator(schema);
      const bridge = new JSONSchemaBridge(schema, schemaValidator);
      setBridge(bridge);
    }
  }, [schema]);

  /**
   * Reset the form when another record or schema gets selected. Resetting it on every render
   * would wipe the unsaved changes whenever the panel re-renders.
   */
  useEffect(() => {
    formRef.current?.reset();
  }, [bridge, JSON.stringify(model)]);

  const onSubmit = (data: unknown) => {
    onUpdate(data);

    if (!model) {
      // Clear the form after a new record got added
      formRef.current?.reset();
    }
  };

  if (!bridge || !schema) {
    return null;
  }

  return (
    <div className="autoform">
      <AutoForm
        schema={bridge}
        model={model || {}}
        onSubmit={onSubmit}
        ref={formRef}
      >
        {label && <h3>{label}</h3>}

        <div className={`fields`}>
          <AutoFields />
        </div>

        <div className={`errors`}>
          <ErrorsField />
        </div>

        <JsonFieldControls model={model} onClear={onClear} />
      </AutoForm>
    </div>
  );
};
