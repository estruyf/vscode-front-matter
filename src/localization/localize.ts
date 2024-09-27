import * as l10n from '@vscode/l10n';

export const localize = (key: string, ...args: (string | number)[]): string => {
  return l10n.t(key, ...args);
};
