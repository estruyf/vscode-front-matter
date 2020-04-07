import * as vscode from 'vscode';
import * as toml from '@iarna/toml';
import { CONFIG_KEY, SETTING_FRONTMATTER_TYPE } from '../constants';

export const getFmLanguage = (): string => {
  const config = vscode.workspace.getConfiguration(CONFIG_KEY);
  const language = config.get(SETTING_FRONTMATTER_TYPE) as string || "YAML";
  return language.toLowerCase();
};

export const getFormatOpts = (format: string): { language: string, delimiters: string | [string, string] | undefined } => {
  const formats: { [prop: string]: { language: string, delimiters: string | [string, string] | undefined }} = {
    yaml: { language: 'yaml', delimiters: '---' },
    toml: { language: 'toml', delimiters: '+++' },
    json: { language: 'json', delimiters: ['{', '}'] },
  };

  return formats[format];
};

export const TomlEngine = {
  engines: {
    toml: {
      parse: (value: string) => {
        return toml.parse(value);
      },
      stringify: (value: any) => {
        return toml.stringify(value);
      }
    }
  }
};