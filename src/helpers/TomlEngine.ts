import * as vscode from 'vscode';
import * as toml from '@iarna/toml';
import { CONFIG_KEY, SETTING_FRONTMATTER_TYPE } from '../constants';

export const FMLanguage = () => {
  const config = vscode.workspace.getConfiguration(CONFIG_KEY);
  const language = config.get(SETTING_FRONTMATTER_TYPE) as string || "YAML";
  return language.toLowerCase();
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