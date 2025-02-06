const illegalRe = (isFileName: boolean) =>
  isFileName ? /[/?<>\\:*|"!.,;{}[\]()+=~`@#$%^&]/g : /[/?<>\\:*|"!.,;{}[\]()_+=~`@#$%^&]/g;
// eslint-disable-next-line no-control-regex
const controlRe = /[\x00-\x1f\x80-\x9f]/g;
const reservedRe = /^\.+$/;
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
const windowsTrailingRe = /[. ]+$/;

function sanitize(input: string, replacement: string, isFileName?: boolean) {
  if (typeof input !== 'string') {
    throw new Error('Input must be string');
  }

  const sanitized = input
    .replace(illegalRe(isFileName || false), replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement)
    .replace(windowsTrailingRe, replacement);
  return sanitized;
}

export default function (input: string, options?: { replacement?: string; isFileName?: boolean }) {
  const replacement = (options && options.replacement) || '';
  const isFileName = options && options.isFileName;
  const output = sanitize(input, replacement, isFileName);
  if (replacement === '') {
    return output;
  }
  return sanitize(output, '', isFileName);
}
