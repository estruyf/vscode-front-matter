import { Engines, getFormatOpts } from ".";
import * as matter from "gray-matter";
import { Settings } from "../helpers";
import { SETTING_FRONTMATTER_TYPE } from "../constants";

export interface Format {
  language: string;
  delimiters: string | [string, string] | undefined;
}

export interface ParsedFrontMatter {
  data: { [key: string]: any };
  content: string
}

export class FrontMatterParser {

  public static fromFile(content: string): ParsedFrontMatter {
    const format = getFormatOpts(this.getLanguage());
    const result = matter(content, { ...Engines, ...format });
    // in the absent of a body when serializing an entry we use an empty one
    // when calling `toFile`, so we don't want to add it when parsing.

    return {
      data: { ...result.data },
      content: (result.content.trim() && result.content)
    };
  }

  public static toFile(
    content: string,
    metadata: Object,
    options?: any
  ) {
    // Stringify to YAML if the format was not set
    const format = getFormatOpts(this.getLanguage());

    const trimLastLineBreak = content.slice(-1) !== '\n';
    const file = matter.stringify(content, metadata, {
      ...Engines,
      ...options,
      ...format
    });
    return trimLastLineBreak && file.slice(-1) === '\n' ? file.substring(0, file.length - 1) : file;
  }

  private static getLanguage() {
    const language = Settings.get(SETTING_FRONTMATTER_TYPE) as string || "YAML";
    return language.toLowerCase();
  }
}