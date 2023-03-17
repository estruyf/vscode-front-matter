import * as yaml from 'yaml';
import * as jsyaml from 'js-yaml';
import * as toml from '@iarna/toml';
import { Format, FrontMatterParser } from '.';

export const getFormatOpts = (format: string): Format => {
  const formats: { [prop: string]: Format } = {
    yaml: { language: 'yaml', delimiters: '---' },
    toml: { language: 'toml', delimiters: '+++' },
    json: { language: 'json', delimiters: '---' }
  };

  return formats[format];
};

const removeCarriageReturn = (value: any) => {
  const replacer = (crntValue: string) => {
    return crntValue.replace(/\r/g, '');
  }

  if (typeof value === "string" && value.endsWith(`\r`)) {
    value = replacer(value);
  } else if (value instanceof Array) {
    value = value.map(v => {
      if (typeof v === "string" && v.endsWith(`\r`)) {
        v = replacer(v);
      }
      return v;
    })
  }

  return value;
}

export const Engines = {
  engines: {
    toml: {
      parse: (value: string) => {
        return toml.parse(value);
      },
      stringify: (value: any) => {
        return toml.stringify(value);
      }
    },
    yaml: {
      parse: (value: string) => {
        return yaml.parse(removeCarriageReturn(value));
      },
      stringify: (obj: any, options?: any) => {
        // Do our own parsing to keep the comments
        if (FrontMatterParser.currentContent) {
          const originalContent = FrontMatterParser.currentContent;
          FrontMatterParser.currentContent = null;

          let frontMatter = getMatter(originalContent);
          if (frontMatter) {
            if (typeof frontMatter === "string" && frontMatter.endsWith(`\r`)) {
              frontMatter = frontMatter.substring(0, frontMatter.length - 1)
            }

            const docYaml = yaml.parseDocument(frontMatter);

            // Update all the new values
            for (const key in obj) {
              let value = obj[key];
              docYaml.set(key, removeCarriageReturn(value));
            }

            // Check if there are values to remove
            for (const key in docYaml.toJSON()) {
              if (typeof obj[key] === undefined) {
                docYaml.delete(key);
              }
            }

            let updatedValue = docYaml.toString({
              lineWidth: 5000
            });

            return updatedValue;
          }
        }

        return yaml.stringify(obj, options);
      }
    }
  }
};

/**
 * Retrieve the front matter from the content
 * @param value
 * @returns
 */
const getMatter = (value: string): string | null => {
  const open = '---';
  const close = '\n' + '---';

  let str = value;

  // get the length of the opening delimiter
  const openLen = open.length;
  if (!startsWith(str, open, openLen)) {
    return null;
  }

  // if the next character after the opening delimiter is
  // a character from the delimiter, then it's not a front-
  // matter delimiter
  if (str.charAt(openLen) === open.slice(-1)) {
    return null;
  }

  // strip the opening delimiter
  str = str.slice(openLen);
  const len = str.length;

  // get the index of the closing delimiter
  let closeIndex = str.indexOf(close);
  if (closeIndex === -1) {
    closeIndex = len;
  }

  // get the raw front-matter block
  return str.slice(0, closeIndex);
};

const startsWith = (str: string, substr: string, len: number) => {
  if (typeof len !== 'number') len = substr.length;
  return str.slice(0, len) === substr;
};
