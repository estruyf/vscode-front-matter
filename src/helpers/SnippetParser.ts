import * as Mustache from 'mustache';
import { SnippetField } from '../models';

export class SnippetParser {
  public static getPlaceholders(
    value: string[] | string,
    openingTags = '[[',
    closingTags = ']]'
  ): string[] {
    const template = SnippetParser.template(value);
    const parseTree = Mustache.parse(template, [openingTags, closingTags]);

    const flattenVariablesFromParseTree = (acc: any, v: any) => {
      if (v[0] === 'name') {
        return acc.concat([v]);
      } else if (v[0] === '&') {
        return acc.concat([v]);
      } else if (v[0] === '#') {
        return acc.concat(v[4].reduce(flattenVariablesFromParseTree, []));
      } else {
        return acc;
      }
    };

    const variables = parseTree.reduce(flattenVariablesFromParseTree, []).map((v: any) => v[1]);

    return variables;
  }

  public static render(
    value: string[] | string,
    data: unknown,
    openingTags = '[[',
    closingTags = ']]'
  ): string {
    const template = SnippetParser.template(value);
    return Mustache.render(template, data, undefined, [openingTags, closingTags]);
  }

  public static getFields(
    value: string[] | string,
    fields: SnippetField[],
    openingTags = '[[',
    closingTags = ']]'
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
