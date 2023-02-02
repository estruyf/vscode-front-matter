import * as Mustache from 'mustache';
import { SnippetField } from '../models';

export class SnippetParser {
  public static getPlaceholders(
    value: string[] | string,
    openingTags: string = '[[',
    closingTags: string = ']]'
  ): string[] {
    const template = SnippetParser.template(value);
    return Mustache.parse(template, [openingTags, closingTags])
      .filter((v) => v[0] === 'name' || v[0] === '&')
      .map((v) => {
        return v[1];
      });
  }

  public static render(
    value: string[] | string,
    data: any,
    openingTags: string = '[[',
    closingTags: string = ']]'
  ): string {
    const template = SnippetParser.template(value);
    return Mustache.render(template, data, undefined, [openingTags, closingTags]);
  }

  public static getFields(
    value: string[] | string,
    fields: SnippetField[],
    openingTags: string = '[[',
    closingTags: string = ']]'
  ) {
    const placeholders = SnippetParser.getPlaceholders(value, openingTags, closingTags);

    const allFields: SnippetField[] = [];

    for (const placeholder of placeholders) {
      const field = fields.find((f) => f.name === placeholder);
      if (field) {
        allFields.push(field);
      } else {
        allFields.push({
          name: placeholder,
          title: placeholder,
          type: 'string',
          single: true,
          default: ''
        });
      }
    }

    return allFields;
  }

  public static template(value: string[] | string) {
    return typeof value === 'string' ? value : value.join('\n');
  }
}
