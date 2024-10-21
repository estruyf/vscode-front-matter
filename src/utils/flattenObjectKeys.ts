import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const flattenObjectKeys = (obj: any, crntKey = '') => {
  let toReturn: string[] = [];
  const keys = Object.keys(obj);

  for (const key of keys) {
    const crntObj = obj[key];

    if (typeof crntObj === 'object' && crntObj !== null && Object.keys(crntObj).length > 0) {
      const hasTextKeys = Object.keys(crntObj).some((subKey) => {
        if (typeof crntObj[subKey] === 'string') {
          return true;
        }

        return false;
      });

      if (hasTextKeys) {
        toReturn.push(join(crntKey, key));
        continue;
      }

      const flatKeyNames = flattenObjectKeys(crntObj, join(crntKey, key));
      toReturn = [...toReturn, ...flatKeyNames];
    } else if (typeof crntObj !== 'string' || Object.keys(crntObj).length === 0) {
      toReturn.push(join(crntKey, key));
    }
  }

  return [...new Set(toReturn)];
};
