import { ComponentType, createElement, Fragment } from 'react';
import { useForm } from 'uniforms';

import AutoField from './AutoField';

export type AutoFieldsProps = {
  autoField?: ComponentType<{ name: string }>;
  element?: ComponentType | string;
  fields?: string[];
  omitFields?: string[];
};

export default function AutoFields({
  autoField = AutoField,
  element = Fragment,
  fields,
  omitFields = [],
  ...props
}: AutoFieldsProps) {
  const { schema } = useForm();

  return createElement(
    element,
    props,
    (fields ?? schema.getSubfields())
      .filter((field) => !omitFields.includes(field))
      .map((field) => createElement(autoField, { key: field, name: field }))
  );
}
