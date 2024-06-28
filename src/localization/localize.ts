import * as l10n from '@vscode/l10n';

export const localize = (key: string, ...args: any[]): string => {
  return l10n.t(key, ...args);
};
