import { parse, parseISO, parseJSON } from "date-fns";


export class DateHelper {
 
  public static formatUpdate(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    value = value.replace(/YYYY/g, 'yyyy');
    value = value.replace(/DD/g, 'dd');
    return value;
  }

  public static tryParse(date: any, format?: string): Date | null {
    if (!date) {
      return null;
    }

    if (date instanceof Date) {
      return date;
    }

    if (typeof date === 'string') {
      const jsonParsed = DateHelper.tryParseJson(date);
      if (DateHelper.isValid(jsonParsed)) {
        return jsonParsed;
      }

      const isoParsed = DateHelper.tryParseIso(date);
      if (DateHelper.isValid(isoParsed)) {
        return isoParsed;
      }

      if (format) {
        const formatParsed = DateHelper.tryFormatParse(date, format);
        if (DateHelper.isValid(formatParsed)) {
          return formatParsed;
        }
      }
    }

    return null;
  }

  public static isValid(date: any): boolean {
    return date instanceof Date && !isNaN(date?.getTime());
  }

  public static tryFormatParse(date: string, format: string): Date | null {
    try {
      return parse(date, format, new Date());
    } catch (err) {
      return null;
    }
  }

  public static tryParseJson(date: string): Date | null {
    try {
      return parseJSON(date);
    } catch (err) {
      return null;
    }
  }

  public static tryParseIso(date: string): Date | null {
    try {
      return parseISO(date);
    } catch (err) {
      return null;
    }
  }
}