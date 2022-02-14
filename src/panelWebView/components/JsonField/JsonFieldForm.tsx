import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import JSONSchemaBridge from 'uniforms-bridge-json-schema';
import { AutoFields, AutoForm, ErrorsField } from '../../../components/uniforms-frontmatter';
import { JsonFieldControls } from './JsonFieldControls';
import { JsonFieldRecord } from './JsonFieldRecord';
import { CollectionIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline';
import Ajv from 'ajv';

export interface IJsonFieldFormProps {
  label: string;
  schema: any | null;
  model: any | null;
  onUpdate: (data: any) => void;
  onClear: () => void;
}

export const JsonFieldForm: React.FunctionComponent<IJsonFieldFormProps> = ({ label, schema, model, onUpdate, onClear }: React.PropsWithChildren<IJsonFieldFormProps>) => {
  const [ bridge, setBridge ] = useState<JSONSchemaBridge | null>(null);

  const ajv = new Ajv({ allErrors: true, useDefaults: true, strict: false });
  ajv.addKeyword({
    keyword: 'fieldType',
    type: "string",
    validate: (schema: any, data: any) => {
      console.log(`ajv`);
      return true;
    }
  });

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

  if (!bridge || !schema) {
    return null;
  }
  
  return (
    <div className='autoform'>
      <AutoForm 
        schema={bridge} 
        model={model || {}}
        onSubmit={onUpdate}
        ref={form => form?.reset()}>

        {  label && <h3>{label}</h3> }

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