import { WhenClause } from './../models/PanelSettings';
import { Field, WhenOperator } from '../models';
import { IMetadata } from '../panelWebView/components/Metadata';

/**
 * Determines whether a field should be displayed based on its "when" clause.
 * @param field - The field to check.
 * @param parent - The parent metadata object.
 * @returns A boolean indicating whether the field should be displayed.
 */
export const fieldWhenClause = (field: Field, parent: IMetadata, allFields?: Field[]): boolean => {
  const when = field.when;
  if (!when) {
    return true;
  }

  const parentField = allFields?.find((f) => f.name === when.fieldRef);
  if (parentField && parentField.when) {
    const renderParent = fieldWhenClause(parentField, parent, allFields);
    if (!renderParent) {
      return false;
    }
  }

  let whenValue = parent[when.fieldRef];

  // If the value is not yet set, check if the field has a default value.
  if (
    typeof whenValue === 'undefined' &&
    parentField &&
    typeof parentField.default !== 'undefined'
  ) {
    whenValue = parentField.default as string | IMetadata | string[] | null;
  }

  if (when.caseSensitive || typeof when.caseSensitive === 'undefined') {
    return caseSensitive(when, field, whenValue);
  } else {
    return caseInsensitive(when, field, whenValue);
  }
};

/**
 * Returns a boolean indicating whether the given `when` clause matches the given `field` and `whenValue`, ignoring case sensitivity.
 * @param when - The `WhenClause` to match against.
 * @param field - The `Field` to match against.
 * @param whenValue - The value to match against the `when` clause.
 * @returns A boolean indicating whether the `when` clause matches the `field` and `whenValue`, ignoring case sensitivity.
 */
const caseInsensitive = (
  when: WhenClause,
  field: Field,
  whenValue: string | IMetadata | string[] | null
) => {
  if (whenValue) {
    whenValue = lowerValue(whenValue);
  }

  const whenClone = Object.assign({}, when);
  whenClone.value = lowerValue(whenClone.value);

  return caseSensitive(whenClone, field, whenValue);
};

/**
 * Determines if a given field matches a when clause with case sensitivity.
 * @param when - The when clause to match against.
 * @param field - The field to match.
 * @param whenValue - The value to match against the when clause.
 * @returns True if the field matches the when clause, false otherwise.
 */
const caseSensitive = (
  when: WhenClause,
  _: Field,
  whenValue: string | IMetadata | string[] | null
) => {
  switch (when.operator) {
    case WhenOperator.equals:
      if (whenValue !== when.value) {
        return false;
      }
      break;
    case WhenOperator.notEquals:
      if (whenValue === when.value) {
        return false;
      }
      break;
    case WhenOperator.contains:
      if (
        (typeof whenValue === 'string' || whenValue instanceof Array) &&
        !whenValue.includes(when.value)
      ) {
        return false;
      }
      break;
    case WhenOperator.notContains:
      if (
        (typeof whenValue === 'string' || whenValue instanceof Array) &&
        whenValue.includes(when.value)
      ) {
        return false;
      }
      break;
    case WhenOperator.startsWith:
      if (typeof whenValue === 'string' && !whenValue.startsWith(when.value)) {
        return false;
      }
      break;
    case WhenOperator.endsWith:
      if (typeof whenValue === 'string' && !whenValue.endsWith(when.value)) {
        return false;
      }
      break;
    case WhenOperator.greaterThan:
      if (typeof whenValue === 'number' && whenValue <= when.value) {
        return false;
      }
      break;
    case WhenOperator.greaterThanOrEqual:
      if (typeof whenValue === 'number' && whenValue < when.value) {
        return false;
      }
      break;
    case WhenOperator.lessThan:
      if (typeof whenValue === 'number' && whenValue >= when.value) {
        return false;
      }
      break;
    case WhenOperator.lessThanOrEqual:
      if (typeof whenValue === 'number' && whenValue > when.value) {
        return false;
      }
      break;
    default:
      break;
  }

  return true;
};

/**
 * Converts the given string or array of strings to lowercase.
 * @param value - The string or array of strings to convert to lowercase.
 * @returns The converted string or array of strings.
 */
const lowerValue = (value: string | string[] | IMetadata) => {
  if (typeof value === 'string') {
    value = value.toLowerCase();
  } else if (value instanceof Array) {
    value = value.map((crntValue) => {
      if (typeof crntValue === 'string') {
        return crntValue.toLowerCase();
      }

      return crntValue;
    });
  }

  return value;
};
