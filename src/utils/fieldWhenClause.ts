import { WhenClause } from './../models/PanelSettings';
import { Field, WhenOperator } from '../models';
import { IMetadata } from '../panelWebView/components/Metadata';

/**
 * Validate the field its "when" clause
 * @param field
 * @param parent
 * @returns
 */
export const fieldWhenClause = (field: Field, parent: IMetadata): boolean => {
  const when = field.when;
  if (!when) {
    return true;
  }

  let whenValue = parent[when.fieldRef];
  if (when.caseSensitive || typeof when.caseSensitive === 'undefined') {
    return caseSensitive(when, field, whenValue);
  } else {
    return caseInsensitive(when, field, whenValue);
  }
};

/**
 * Case sensitive checks
 * @param when
 * @param field
 * @param whenValue
 * @returns
 */
const caseInsensitive = (
  when: WhenClause,
  field: Field,
  whenValue: string | IMetadata | string[] | null
) => {
  whenValue = lowerValue(whenValue);

  const whenClone = Object.assign({}, when);
  whenClone.value = lowerValue(whenClone.value);

  return caseSensitive(whenClone, field, whenValue);
};

/**
 * Case insensitive checks
 * @param when
 * @param field
 * @param whenValue
 * @returns
 */
const caseSensitive = (
  when: WhenClause,
  field: Field,
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
 * Lower the value(s)
 * @param value
 * @returns
 */
const lowerValue = (value: string | string[] | any) => {
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
