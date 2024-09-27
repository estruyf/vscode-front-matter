import { Engines, getFormatOpts } from '.';
import * as matter from 'gray-matter';
import { Settings } from '../helpers';
import { SETTING_FRONTMATTER_TYPE } from '../constants';

export interface Format {
  language: string;
  delimiters: string | [string, string] | undefined;
}

export interface ParsedFrontMatter {
  data: { [key: string]: any };
  content: string;
  path?: string;
}

export class FrontMatterParser {
  public static currentContent: string | null = null;

  /**
   * Convert the current content to a Front Matter object
   * @param content
   * @returns
   */
  public static fromFile(content: string): ParsedFrontMatter {
    const format = getFormatOpts(this.getLanguageFromContent(content));
    FrontMatterParser.currentContent = content;
    const result = matter(content, { ...Engines, ...format });
    // in the absent of a body when serializing an entry we use an empty one
    // when calling `toFile`, so we don't want to add it when parsing.

    return {
      data: { ...result.data },
      content: result.content.trim() && result.content
    };
  }

  /**
   * Convert the Front Matter object to text
   * @param content
   * @param metadata
   * @param options
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static toFile(content: string, metadata: any, originalContent?: string, options?: any) {
    // Stringify to YAML if the format was not set
    const format = getFormatOpts(this.getLanguageFromContent(originalContent));

    const trimLastLineBreak = content.slice(-1) !== '\n';
    const file = matter.stringify(content, metadata, {
      ...Engines,
      ...options,
      ...format
    });
    return trimLastLineBreak && file.slice(-1) === '\n' ? file.substring(0, file.length - 1) : file;
  }

  /**
   * Validate the type of front matter language that is used
   * @param contents
   */
  public static getLanguageFromContent(contents: string | undefined) {
    if (!contents) {
      return this.getLanguage();
    }

    if (contents.startsWith(`+++`)) {
      return 'toml';
    } else if (contents.startsWith(`---`)) {
      return 'yaml';
    } else if (contents.startsWith(`{`)) {
      return 'json';
    } else {
      return 'yaml';
    }
  }

  /**
   * Get the front matter language type
   * @returns
   */
  private static getLanguage() {
    const language = (Settings.get(SETTING_FRONTMATTER_TYPE) as string) || 'YAML';
    return language.toLowerCase();
  }
}
