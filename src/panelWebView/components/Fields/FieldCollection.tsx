import * as React from 'react';
import { BlockFieldData, Field, PanelSettings } from '../../../models';
import { IMetadata } from '../Metadata';
import { FieldTitle } from './FieldTitle';

export interface IFieldCollectionProps {
  field: Field;
  parent: IMetadata;
  parentFields: string[];
  blockData: BlockFieldData | undefined;
  settings: PanelSettings;
  renderFields: (
    ctFields: Field[],
    parent: IMetadata,
    parentFields: string[],
    blockData?: BlockFieldData,
    onFieldUpdate?: (field: string | undefined, value: any, parents: string[]) => void,
    parentBlock?: string | null,
    triggerUpdateOnDefault?: boolean
  ) => (JSX.Element | null)[] | undefined;
  onChange: (field: string | undefined, value: any, parents: string[]) => void;
}

export const FieldCollection: React.FunctionComponent<IFieldCollectionProps> = ({
  field,
  parent,
  parentFields,
  blockData,
  settings,
  renderFields,
  onChange
}: React.PropsWithChildren<IFieldCollectionProps>) => {
  const [fields, setFields] = React.useState<Field[]>([]);

  React.useEffect(() => {
    if (!settings.fieldGroups) {
      return
    }

    const group = settings.fieldGroups.find((group) => group.id === field.fieldGroup);
    if (group) {
      setFields(group.fields);
    }
  }, [field, settings?.fieldGroups]);

  if (!fields || fields.length === 0) {
    return null;
  }

  return (
    <div className={`metadata_field__box`}>
      <FieldTitle
        className={`metadata_field__label_parent`}
        label={field.title || field.name}
        icon={undefined}
        required={field.required}
      />

      {field.description && (
        <p className={`metadata_field__description`}>{field.description}</p>
      )}

      {renderFields(
        fields,
        parent,
        [...parentFields, field.name],
        blockData,
        onChange
      )}
    </div>
  );
};