import { Field, WhenOperator } from "../models";
import { IMetadata } from "../panelWebView/components/Metadata";


export const fieldWhenClause = (field: Field, parent: IMetadata): boolean => {
  const when = field.when;
  if (!when) {
    return true;
  }

  const whenValue = parent[when.fieldRef];

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
      if ((typeof whenValue === "string" || whenValue instanceof Array) && !whenValue.includes(when.value)) {
        return false;
      }
      break;
    case WhenOperator.notContains:
      if ((typeof whenValue === "string" || whenValue instanceof Array) && whenValue.includes(when.value)) {
        return false;
      }
      break;
    case WhenOperator.startsWith:
      if (typeof whenValue === "string" && !whenValue.startsWith(when.value)) {
        return false;
      }
      break;
    case WhenOperator.endsWith:
      if (typeof whenValue === "string" && !whenValue.endsWith(when.value)) {
        return false;
      }
      break;
    case WhenOperator.greaterThan:
      if (typeof whenValue === "number" && whenValue <= when.value) {
        return false;
      }
      break;
    case WhenOperator.greaterThanOrEqual:
      if (typeof whenValue === "number" && whenValue < when.value) {
        return false;
      }
      break;
    case WhenOperator.lessThan:
      if (typeof whenValue === "number" && whenValue >= when.value) {
        return false;
      }
      break;
    case WhenOperator.lessThanOrEqual:
      if (typeof whenValue === "number" && whenValue > when.value) {
        return false;
      }
      break;
    default:
      break;
  }

  return true;
}