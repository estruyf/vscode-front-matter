import * as toml from '@iarna/toml';
import { Format } from '.';

export const getFormatOpts = (format: string): Format => {
  const formats: { [prop: string]: Format} = {
    yaml: { language: 'yaml', delimiters: '---' },
    toml: { language: 'toml', delimiters: '+++' },
    json: { language: 'json', delimiters: '---' },
  };

  return formats[format];
};

export const Engines = {
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
}